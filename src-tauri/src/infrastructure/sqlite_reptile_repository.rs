use async_trait::async_trait;
use sqlx::SqlitePool;
use crate::entities::{Reptile, ReptileRepository};

pub struct SqliteReptileRepository {
    pool: SqlitePool
}

/// Implements all traits required by the Reptile Repository
#[async_trait]
impl ReptileRepository for SqliteReptileRepository {
    async fn list(&self) -> Result<Vec<Reptile>,sqlx::Error> {
        let result = sqlx::query_as::<_, Reptile>("SELECT id, name, birthday AS birth_date, species, weight_grams, length_cm, last_shed FROM Reptiles")
            .fetch_all(&self.pool)
            .await?;

        Ok(result)
    }
    
    async fn add(&self, reptile: Reptile) -> Result<Reptile,sqlx::Error> {
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

/// Implemnnts the new() function.
impl SqliteReptileRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}
