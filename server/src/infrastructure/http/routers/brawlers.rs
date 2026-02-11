use std::sync::Arc;

use axum_extra::extract::Multipart; use axum::{ Extension, Json, Router, extract::State, http::StatusCode, response::IntoResponse,   
    routing::post,
};

use crate::{
    application::use_cases::brawlers::BrawlersUseCase,
    domain::{
        repositories::brawlers::BrawlerRepository,
        value_objects::{brawler_model::{RegisterBrawlerModel, UpdateBrawlerModel}, uploaded_img::UploadBase64Img},
    },
    infrastructure::{
        database::{postgresql_connection::PgPoolSquad, repositories::brawlers::BrawlerPostgres},
        http::middlewares::auth::auth,
    },
};
use base64::{engine::general_purpose, Engine};

pub fn routes(db_pool: Arc<PgPoolSquad>) -> Router {
    let repository = BrawlerPostgres::new(db_pool);
    let user_case = BrawlersUseCase::new(Arc::new(repository));

    let protected_routes = Router::new()
        .route("/avatar", post(upload_avatar_multipart))
        .route("/profile", post(update_profile))
        .route_layer(axum::middleware::from_fn(auth));

    Router::new()
        .merge(protected_routes)
        .route("/register", post(register))
        .with_state(Arc::new(user_case))
}

pub async fn register<T>(
    State(user_case): State<Arc<BrawlersUseCase<T>>>,
    Json(model): Json<RegisterBrawlerModel>,
) -> impl IntoResponse
where
    T: BrawlerRepository + Send + Sync,
{
    match user_case.register(model).await {
        Ok(passport) => (StatusCode::CREATED, Json(passport)).into_response(),

        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),    
    }
}

pub async fn upload_avatar_multipart<T>(
    State(user_case): State<Arc<BrawlersUseCase<T>>>,
    Extension(user_id): Extension<i32>,
    mut multipart: Multipart,
) -> impl IntoResponse
where
    T: BrawlerRepository + Send + Sync,
{
    let mut encoded: Option<String> = None;

    while let Ok(Some(field)) = multipart.next_field().await {
        if let Some(name) = field.name() {
            if name == "avatar" {
                match field.bytes().await {
                    Ok(bytes) => {
                        let base64 = general_purpose::STANDARD.encode(bytes);
                        encoded = Some(base64);
                        break;
                    }
                    Err(e) => {
                        return (StatusCode::BAD_REQUEST, e.to_string()).into_response();
                    }
                }
            }
        }
    }

    if let Some(b64) = encoded {
        match user_case.upload_base64img(user_id, b64).await {
            Ok(upload_img) => (StatusCode::OK, Json(upload_img)).into_response(),
            Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),
        }
    } else {
        (StatusCode::BAD_REQUEST, "avatar file is required").into_response()
    }
}

pub async fn update_profile<T>(
    State(user_case): State<Arc<BrawlersUseCase<T>>>,
    Extension(user_id): Extension<i32>,
    Json(model): Json<UpdateBrawlerModel>,
) -> impl IntoResponse
where
    T: BrawlerRepository + Send + Sync,
{
    match user_case.update_profile(user_id, model.display_name).await {
        Ok(_) => StatusCode::OK.into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()).into_response(),    
    }
}

