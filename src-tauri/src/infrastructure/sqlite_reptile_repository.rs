use crate::entities::{FeedingEntry, GrowthEntry, Reptile, ReptileProfileUpdate, ReptileRepository};
use async_trait::async_trait;
use sqlx::SqlitePool;

pub struct SqliteReptileRepository {
    pool: SqlitePool,
}

#[async_trait]
impl ReptileRepository for SqliteReptileRepository {
    async fn feeding_entries(&self, reptile_id: &str) -> Result<Vec<FeedingEntry>, sqlx::Error> {
        sqlx::query_as::<_, FeedingEntry>("SELECT id, date, mouse_size AS food_type, amount, powdered, COALESCE(powder_kind, '') AS powder_type FROM FeedingEntries WHERE reptile_id = ? ORDER BY date DESC")
            .bind(reptile_id).fetch_all(&self.pool).await
    }

    async fn add_feeding(&self, reptile_id: &str, entry: FeedingEntry) -> Result<FeedingEntry, sqlx::Error> {
        sqlx::query("INSERT INTO FeedingEntries (id, reptile_id, date, amount, mouse_size, powdered, powder_kind) VALUES (?, ?, ?, ?, ?, ?, ?)")
            .bind(&entry.id).bind(reptile_id).bind(&entry.date).bind(entry.amount).bind(&entry.food_type).bind(entry.powdered).bind(if entry.powdered { Some("vitamin") } else { None }).execute(&self.pool).await?;
        Ok(entry)
    }

    async fn update_feeding(&self, reptile_id: &str, entry: FeedingEntry) -> Result<FeedingEntry, sqlx::Error> {
        sqlx::query("UPDATE FeedingEntries SET date = ?, amount = ?, mouse_size = ?, powdered = ?, powder_kind = ? WHERE id = ? AND reptile_id = ?")
            .bind(&entry.date).bind(entry.amount).bind(&entry.food_type).bind(entry.powdered).bind(if entry.powdered { Some("vitamin") } else { None }).bind(&entry.id).bind(reptile_id).execute(&self.pool).await?;
        Ok(entry)
    }

    async fn delete_feeding(&self, reptile_id: &str, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM FeedingEntries WHERE id = ? AND reptile_id = ?").bind(id).bind(reptile_id).execute(&self.pool).await?;
        Ok(())
    }
    async fn list(&self) -> Result<Vec<Reptile>, sqlx::Error> {
        sqlx::query_as::<_, Reptile>("SELECT id, name, birthday AS birth_date, species, weight_grams, length_cm, last_shed FROM Reptiles")
            .fetch_all(&self.pool)
            .await
    }

    async fn growth_entries(&self, reptile_id: &str) -> Result<Vec<GrowthEntry>, sqlx::Error> {
        sqlx::query_as::<_, GrowthEntry>("SELECT id, date, weight_grams, length_cm FROM GrowthEntries WHERE reptile_id = ? ORDER BY date DESC")
            .bind(reptile_id)
            .fetch_all(&self.pool)
            .await
    }

    async fn add_growth_entry(&self, reptile_id: &str, entry: GrowthEntry) -> Result<GrowthEntry, sqlx::Error> {
        sqlx::query("INSERT INTO GrowthEntries (id, reptile_id, date, weight_grams, length_cm) VALUES (?, ?, ?, ?, ?)")
            .bind(&entry.id).bind(reptile_id).bind(&entry.date).bind(entry.weight_grams).bind(entry.length_cm).execute(&self.pool).await?;
        Ok(entry)
    }

    async fn update_growth_entry(&self, reptile_id: &str, entry: GrowthEntry) -> Result<GrowthEntry, sqlx::Error> {
        sqlx::query("UPDATE GrowthEntries SET date = ?, weight_grams = ?, length_cm = ? WHERE id = ? AND reptile_id = ?")
            .bind(&entry.date).bind(entry.weight_grams).bind(entry.length_cm).bind(&entry.id).bind(reptile_id).execute(&self.pool).await?;
        Ok(entry)
    }

    async fn delete_growth_entry(&self, reptile_id: &str, id: &str) -> Result<(), sqlx::Error> {
        sqlx::query("DELETE FROM GrowthEntries WHERE id = ? AND reptile_id = ?").bind(id).bind(reptile_id).execute(&self.pool).await?;
        Ok(())
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

    async fn update(&self, reptile_id: &str, update: ReptileProfileUpdate) -> Result<Reptile, sqlx::Error> {
        let result = sqlx::query("UPDATE Reptiles SET name = ?, species = ?, birthday = ?, weight_grams = ?, length_cm = ?, last_shed = ? WHERE id = ?")
            .bind(&update.name)
            .bind(&update.species)
            .bind(&update.birth_date)
            .bind(update.weight_grams)
            .bind(update.length_cm)
            .bind(&update.last_shed)
            .bind(reptile_id)
            .execute(&self.pool)
            .await?;
        if result.rows_affected() == 0 {
            return Err(sqlx::Error::RowNotFound);
        }
        sqlx::query_as::<_, Reptile>("SELECT id, name, birthday AS birth_date, species, weight_grams, length_cm, last_shed FROM Reptiles WHERE id = ?")
            .bind(reptile_id)
            .fetch_one(&self.pool)
            .await
    }
}

impl SqliteReptileRepository {
    pub fn new(pool: SqlitePool) -> Self {
        Self { pool }
    }
}
