use crate::entities::{GrowthEntry, Reptile, ReptileRepository};
use async_trait::async_trait;
use sqlx::SqlitePool;

pub struct SqliteReptileRepository {
    pool: SqlitePool,
}

#[async_trait]
impl ReptileRepository for SqliteReptileRepository {
    async fn list(&self) -> Result<Vec<Reptile>, sqlx::Error> {
        sqlx::query_as::<_, Reptile>("SELECT id, name, birthday AS birth_date, species, weight_grams, length_cm, last_shed FROM Reptiles")
            .fetch_all(&self.pool)
            .await
    }

    async fn growth_entries(&self, reptile_id: &str) -> Result<Vec<GrowthEntry>, sqlx::Error> {
        sqlx::query_as::<_, GrowthEntry>("SELECT id, date, weight_grams, length_cm FROM GrowthEntries WHERE reptile_id = ? ORDER BY date DESC LIMIT 5")
            .bind(reptile_id)
            .fetch_all(&self.pool)
            .await
    }

    async fn add(&self, reptile: Reptile) -> Result<Reptile, sqlx::Error> {
        sqlx::query("INSERT INTO Reptiles (id, name, birthday, species, weight_grams, length_cm, last_shed) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind(&reptile.id)
            .bind(&reptile.name)
            .bind(&reptile.birth_date)
            .bind(&reptile.species)
            .bind(reptile.weight_grams)
            .bind(reptile.length_cm)
            .bind(&reptile.last_shed)
            .execute(&self.pool)
            .await?;

        Ok(reptile)
    }
}

impl SqliteReptileRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}
