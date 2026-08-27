use async_trait::async_trait;
use sqlx::{FromRow, SqlitePool};
use crate::entities::{Reptile, ReptileRepository};

pub struct SqliteReptileRepository {
    pool: SqlitePool
}

#[derive(FromRow)]
struct ReptileRow {
    id: String,
    name: String,
    birthday: String,
}

/// Transforms ReptileRow into Reptile
impl From<ReptileRow> for Reptile {
    fn from(row: ReptileRow) -> Self {
        Reptile {
            id: row.id,
            name: row.name,
            birth_date: row.birthday,
        }
    }
}

/// Implements all traits required by the Reptile Repository
#[async_trait]
impl ReptileRepository for SqliteReptileRepository {
    async fn list(&self) -> Result<Vec<Reptile>,sqlx::Error> {
        let result: Vec<ReptileRow> = sqlx::query_as("SELECT id,name,birthday FROM Reptiles")
            .fetch_all(&self.pool)
            .await?;
        
        Ok(result.into_iter().map(Reptile::from).collect())
    }
    
    async fn add(&self, reptile: Reptile) -> Result<Reptile,sqlx::Error> {
        sqlx::query("INSERT INTO Reptiles (id, name, birthday) VALUES (?, ?, ?)")
            .bind(&reptile.id)
            .bind(&reptile.name)
            .bind(&reptile.birth_date)
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