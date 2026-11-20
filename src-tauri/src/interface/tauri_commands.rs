use crate::entities::{FeedingEntry, GrowthEntry, Reptile, ReptileProfileUpdate};
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

#[derive(Deserialize)]
pub struct GrowthInput { id: Option<String>, date: String, weight_grams: f64, length_cm: f64 }

fn growth_entry(input: GrowthInput) -> GrowthEntry {
    GrowthEntry { id: input.id.unwrap_or_else(|| Uuid::new_v4().to_string()), date: input.date, weight_grams: input.weight_grams, length_cm: input.length_cm }
}

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
pub async fn add_growth_entry(ctx: State<'_, Ctx>, reptile_id: String, req: GrowthInput) -> Result<GrowthEntry, String> {
    ctx.reptile_service.add_growth_entry(&reptile_id, growth_entry(req)).await.map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn update_growth_entry(ctx: State<'_, Ctx>, reptile_id: String, req: GrowthInput) -> Result<GrowthEntry, String> {
    ctx.reptile_service.update_growth_entry(&reptile_id, growth_entry(req)).await.map_err(|error| error.to_string())
}

#[tauri::command]
pub async fn delete_growth_entry(ctx: State<'_, Ctx>, reptile_id: String, id: String) -> Result<(), String> {
    ctx.reptile_service.delete_growth_entry(&reptile_id, &id).await.map_err(|error| error.to_string())
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

#[tauri::command]
pub async fn update_reptile(ctx: State<'_, Ctx>, reptile_id: String, req: ReptileProfileUpdate) -> Result<Reptile, String> {
    if req.name.trim().is_empty()
        || !req.weight_grams.is_finite()
        || req.weight_grams < 0.0
        || !req.length_cm.is_finite()
        || req.length_cm < 0.0
        || (!req.birth_date.is_empty() && !is_date(&req.birth_date))
    {
        return Err("Invalid reptile profile".to_owned());
    }

    ctx.reptile_service.update(&reptile_id, req).await.map_err(|error| error.to_string())
}

fn is_date(value: &str) -> bool {
    let Some((year, month_day)) = value.split_once('-') else { return false };
    let Some((month, day)) = month_day.split_once('-') else { return false };
    if year.len() != 4 || month.len() != 2 || day.len() != 2 { return false; }
    let (Ok(year), Ok(month), Ok(day)) = (year.parse::<i32>(), month.parse::<u32>(), day.parse::<u32>()) else { return false };
    if year < 1 || !(1..=12).contains(&month) { return false; }
    let leap = year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
    let days = match month { 2 if leap => 29, 2 => 28, 4 | 6 | 9 | 11 => 30, _ => 31 };
    (1..=days).contains(&day)
}
