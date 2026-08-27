use crate::entities::Reptile;
use async_trait::async_trait;


#[async_trait]
pub trait ReptileRepository: Send + Sync {
    async fn list(&self) -> Result<Vec<Reptile>,sqlx::Error>;
    
    async fn add(&self, reptile: Reptile) -> Result<Reptile,sqlx::Error>;
}