use serde::Serialize;
use sqlx::FromRow;

#[derive(FromRow ,Serialize)]
pub struct Reptile {
    pub id: String,
    pub name: String,
    pub birth_date: String,
}
