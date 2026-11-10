use crate::entities::{FeedingEntry, GrowthEntry, Reptile, ReptileRepository};
use std::sync::Arc;

pub struct ReptileService {
    repo: Arc<dyn ReptileRepository + Send + Sync>,
}

impl ReptileService {
    pub fn new(repo: Arc<dyn ReptileRepository + Send + Sync>) -> Self {
        Self { repo }
    }

    pub async fn list(&self) -> Result<Vec<Reptile>, sqlx::Error> {
        self.repo.list().await
    }

    pub async fn growth_entries(&self, reptile_id: &str) -> Result<Vec<GrowthEntry>, sqlx::Error> {
        self.repo.growth_entries(reptile_id).await
    }

    pub async fn feeding_entries(&self, id: &str) -> Result<Vec<FeedingEntry>, sqlx::Error> { self.repo.feeding_entries(id).await }
    pub async fn add_feeding(&self, reptile_id: &str, entry: FeedingEntry) -> Result<FeedingEntry, sqlx::Error> { self.repo.add_feeding(reptile_id, entry).await }
    pub async fn update_feeding(&self, reptile_id: &str, entry: FeedingEntry) -> Result<FeedingEntry, sqlx::Error> { self.repo.update_feeding(reptile_id, entry).await }
    pub async fn delete_feeding(&self, reptile_id: &str, id: &str) -> Result<(), sqlx::Error> { self.repo.delete_feeding(reptile_id, id).await }

    pub async fn add(&self, reptile: Reptile) -> Result<Reptile, sqlx::Error> {
        self.repo.add(reptile).await
    }
}
