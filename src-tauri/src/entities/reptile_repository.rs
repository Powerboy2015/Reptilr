use crate::entities::{GrowthEntry, Reptile};
use async_trait::async_trait;

#[async_trait]
pub trait ReptileRepository: Send + Sync {
    async fn list(&self) -> Result<Vec<Reptile>, sqlx::Error>;
    async fn growth_entries(&self, reptile_id: &str) -> Result<Vec<GrowthEntry>, sqlx::Error>;
    async fn add(&self, reptile: Reptile) -> Result<Reptile, sqlx::Error>;
}
