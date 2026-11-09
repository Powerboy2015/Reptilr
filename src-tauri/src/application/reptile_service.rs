use crate::entities::{GrowthEntry, Reptile, ReptileRepository};
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

    pub async fn add(&self, reptile: Reptile) -> Result<Reptile, sqlx::Error> {
        self.repo.add(reptile).await
    }
}
