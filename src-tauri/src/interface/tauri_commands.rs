use serde::Deserialize;
use tauri::State;
use uuid::Uuid;
use crate::Ctx;
use crate::entities::Reptile;

#[derive(Deserialize)]
pub struct AddReptileDto {
    name: String,
    species: String,
    birth_date: Option<String>,
    weight_grams: Option<f64>,
    length_cm: Option<f64>,
    last_shed: Option<String>,
}

#[tauri::command]
pub async fn get_reptile_list(ctx: State<'_,Ctx>) -> Result<Vec<Reptile>,String> {
    let test = ctx.reptile_service.list().await.unwrap();
    Ok(test)
}

#[tauri::command]
pub async fn add_reptile(ctx: State<'_,Ctx>,req: AddReptileDto) -> Result<Reptile,String> {
    let reptile = Reptile {
        name: req.name,
        birth_date: req.birth_date.unwrap_or_default(),
        species: req.species,
        weight_grams: req.weight_grams.unwrap_or_default(),
        length_cm: req.length_cm.unwrap_or_default(),
        last_shed: req.last_shed.unwrap_or_default(),
        id: Uuid::new_v4().to_string(),
    };

    let resp = ctx.reptile_service.add(reptile).await.unwrap();
    Ok(resp)
}
