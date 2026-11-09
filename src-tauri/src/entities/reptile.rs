use serde::Serialize;
use sqlx::FromRow;

#[derive(FromRow ,Serialize)]
pub struct Reptile {
    pub id: String,
    pub name: String,
    pub birth_date: String,
    pub species: String,
    pub weight_grams: f64,
    pub length_cm: f64,
    pub last_shed: String,
}
