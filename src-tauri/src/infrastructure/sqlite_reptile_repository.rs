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
        let result = sqlx::query("UPDATE FeedingEntries SET date = ?, amount = ?, mouse_size = ?, powdered = ?, powder_kind = ? WHERE id = ? AND reptile_id = ?")
            .bind(&entry.date).bind(entry.amount).bind(&entry.food_type).bind(entry.powdered).bind(if entry.powdered { Some("vitamin") } else { None }).bind(&entry.id).bind(reptile_id).execute(&self.pool).await?;
        if result.rows_affected() == 0 { return Err(sqlx::Error::RowNotFound); }
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
        let result = sqlx::query("UPDATE GrowthEntries SET date = ?, weight_grams = ?, length_cm = ? WHERE id = ? AND reptile_id = ?")
            .bind(&entry.date).bind(entry.weight_grams).bind(entry.length_cm).bind(&entry.id).bind(reptile_id).execute(&self.pool).await?;
        if result.rows_affected() == 0 { return Err(sqlx::Error::RowNotFound); }
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

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::SqlitePoolOptions;

    async fn database() -> SqlitePool {
        let pool = SqlitePoolOptions::new().max_connections(1).connect("sqlite::memory:").await.unwrap();
        for migration in [
            include_str!("../../migrations/20260123120000_init.sql"),
            include_str!("../../migrations/20260123120001_addReptile.sql"),
            include_str!("../../migrations/20261109120000_expand_reptile_data.sql"),
        ] {
            sqlx::raw_sql(migration).execute(&pool).await.unwrap();
        }
        pool
    }

    #[test]
    fn seed_cleanup_preserves_user_data() {
        tauri::async_runtime::block_on(async {
            let cleanup = include_str!("../../migrations/20261118120000_remove_unused_seed.sql");
            let pool = database().await;
            sqlx::raw_sql(cleanup).execute(&pool).await.unwrap();
            assert_eq!(sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM Reptiles").fetch_one(&pool).await.unwrap(), 0);

            let pool = database().await;
            sqlx::query("UPDATE Reptiles SET name = 'My reptile' WHERE id = 'uuid'").execute(&pool).await.unwrap();
            sqlx::raw_sql(cleanup).execute(&pool).await.unwrap();
            assert_eq!(sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM Reptiles").fetch_one(&pool).await.unwrap(), 1);

            let pool = database().await;
            sqlx::query("INSERT INTO GrowthEntries VALUES ('g1', 'uuid', '2026-11-18', 100, 30)").execute(&pool).await.unwrap();
            sqlx::raw_sql(cleanup).execute(&pool).await.unwrap();
            assert_eq!(sqlx::query_scalar::<_, i64>("SELECT COUNT(*) FROM Reptiles").fetch_one(&pool).await.unwrap(), 1);
        });
    }

    #[test]
    fn updates_require_an_existing_entry() {
        tauri::async_runtime::block_on(async {
            let repo = SqliteReptileRepository::new(database().await);
            let feeding = FeedingEntry { id: "missing".into(), date: "2026-11-18".into(), food_type: "FUZZY".into(), amount: 1, powdered: false, powder_type: "".into() };
            let growth = GrowthEntry { id: "missing".into(), date: "2026-11-18".into(), weight_grams: 100.0, length_cm: 30.0 };
            assert!(matches!(repo.update_feeding("uuid", feeding).await, Err(sqlx::Error::RowNotFound)));
            assert!(matches!(repo.update_growth_entry("uuid", growth).await, Err(sqlx::Error::RowNotFound)));
            let saved = GrowthEntry { id: "g1".into(), date: "2026-11-18".into(), weight_grams: 100.0, length_cm: 30.0 };
            repo.add_growth_entry("uuid", saved).await.unwrap();
            let edited = GrowthEntry { id: "g1".into(), date: "2026-11-18".into(), weight_grams: 150.0, length_cm: 40.0 };
            repo.update_growth_entry("uuid", edited).await.unwrap();
            assert_eq!(repo.growth_entries("uuid").await.unwrap()[0].weight_grams, 150.0);
            let saved = FeedingEntry { id: "f1".into(), date: "2026-11-18".into(), food_type: "FUZZY".into(), amount: 1, powdered: false, powder_type: "".into() };
            repo.add_feeding("uuid", saved).await.unwrap();
            let edited = FeedingEntry { id: "f1".into(), date: "2026-11-18".into(), food_type: "FUZZY".into(), amount: 2, powdered: false, powder_type: "".into() };
            repo.update_feeding("uuid", edited).await.unwrap();
            assert_eq!(repo.feeding_entries("uuid").await.unwrap()[0].amount, 2);
        });
    }
}
