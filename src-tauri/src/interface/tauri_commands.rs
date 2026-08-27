use serde::Deserialize;
use tauri::State;
use uuid::Uuid;
use crate::Ctx;
use crate::entities::Reptile;

#[derive(Deserialize)]
pub struct AddReptileDto {
    name: String,
    birth_date: String,
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
        birth_date: req.birth_date,
        id: Uuid::new_v4().to_string(),
    };

    let resp = ctx.reptile_service.add(reptile).await.unwrap();
    Ok(resp)
}
