use crate::entities::{Reptile, ReptileRepository};
use std::sync::Arc;


pub struct ReptileService {
    repo: Arc<dyn ReptileRepository + Send + Sync>,
}

impl ReptileService {
    pub fn new(repo: Arc<dyn ReptileRepository + Send + Sync>) -> Self {
        Self { repo }
    }

    pub async fn list(&self) -> Result<Vec<Reptile>,sqlx::Error> {
        self.repo.list().await
    }

    pub async fn add(&self, reptile: Reptile) -> Result<Reptile,sqlx::Error> {
        self.repo.add(reptile).await
    }
}

