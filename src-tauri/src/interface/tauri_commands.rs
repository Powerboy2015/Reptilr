use crate::entities::{FeedingEntry, GrowthEntry, Reptile};
use crate::Ctx;
use serde::Deserialize;
use tauri::State;
use uuid::Uuid;

#[derive(Deserialize)]
pub struct AddReptileDto {
    name: String,
    species: String,
    birth_date: Option<String>,
    weight_grams: Option<f64>,
    length_cm: Option<f64>,
    last_shed: Option<String>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FeedingInput { id: Option<String>, date: String, food_type: String, amount: i64, powdered: bool, powder_type: String }

fn feeding_entry(input: FeedingInput) -> FeedingEntry {
    FeedingEntry { id: input.id.unwrap_or_else(|| Uuid::new_v4().to_string()), date: input.date, food_type: input.food_type, amount: input.amount, powdered: input.powdered, powder_type: input.powder_type }
}

#[tauri::command]
pub async fn get_feeding_entries(ctx: State<'_, Ctx>, reptile_id: String) -> Result<Vec<FeedingEntry>, String> { ctx.reptile_service.feeding_entries(&reptile_id).await.map_err(|e| e.to_string()) }
#[tauri::command]
pub async fn add_feeding(ctx: State<'_, Ctx>, reptile_id: String, req: FeedingInput) -> Result<FeedingEntry, String> { ctx.reptile_service.add_feeding(&reptile_id, feeding_entry(req)).await.map_err(|e| e.to_string()) }
#[tauri::command]
pub async fn update_feeding(ctx: State<'_, Ctx>, reptile_id: String, req: FeedingInput) -> Result<FeedingEntry, String> { ctx.reptile_service.update_feeding(&reptile_id, feeding_entry(req)).await.map_err(|e| e.to_string()) }
#[tauri::command]
pub async fn delete_feeding(ctx: State<'_, Ctx>, reptile_id: String, id: String) -> Result<(), String> { ctx.reptile_service.delete_feeding(&reptile_id, &id).await.map_err(|e| e.to_string()) }

#[tauri::command]
pub async fn get_reptile_list(ctx: State<'_, Ctx>) -> Result<Vec<Reptile>, String> {
    ctx.reptile_service.list().await.map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn get_growth_entries(ctx: State<'_, Ctx>, reptile_id: String) -> Result<Vec<GrowthEntry>, String> {
    ctx.reptile_service.growth_entries(&reptile_id).await.map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn add_reptile(ctx: State<'_, Ctx>, req: AddReptileDto) -> Result<Reptile, String> {
    let reptile = Reptile {
        name: req.name,
        birth_date: req.birth_date.unwrap_or_default(),
        species: req.species,
        weight_grams: req.weight_grams.unwrap_or_default(),
        length_cm: req.length_cm.unwrap_or_default(),
        last_shed: req.last_shed.unwrap_or_default(),
        id: Uuid::new_v4().to_string(),
    };

    ctx.reptile_service.add(reptile).await.map_err(|error| error.to_string())
}
