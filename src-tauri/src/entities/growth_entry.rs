use serde::Serialize;
use sqlx::FromRow;

#[derive(FromRow, Serialize)]
pub struct GrowthEntry {
    pub id: String,
    pub date: String,
    pub weight_grams: f64,
    pub length_cm: f64,
}
