use crate::entities::{FeedingEntry, GrowthEntry, Reptile};
use async_trait::async_trait;

#[async_trait]
pub trait ReptileRepository: Send + Sync {
    async fn list(&self) -> Result<Vec<Reptile>, sqlx::Error>;
    async fn growth_entries(&self, reptile_id: &str) -> Result<Vec<GrowthEntry>, sqlx::Error>;
    async fn feeding_entries(&self, reptile_id: &str) -> Result<Vec<FeedingEntry>, sqlx::Error>;
    async fn add_feeding(&self, reptile_id: &str, entry: FeedingEntry) -> Result<FeedingEntry, sqlx::Error>;
    async fn update_feeding(&self, reptile_id: &str, entry: FeedingEntry) -> Result<FeedingEntry, sqlx::Error>;
    async fn delete_feeding(&self, reptile_id: &str, id: &str) -> Result<(), sqlx::Error>;
    async fn add(&self, reptile: Reptile) -> Result<Reptile, sqlx::Error>;
}
