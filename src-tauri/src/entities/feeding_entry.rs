use serde::Serialize;
use sqlx::FromRow;

#[derive(FromRow, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FeedingEntry {
    pub id: String,
    pub date: String,
    pub food_type: String,
    pub amount: i64,
    pub powdered: bool,
    pub powder_type: String,
}
