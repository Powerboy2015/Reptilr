ALTER TABLE Reptiles ADD COLUMN species TEXT NOT NULL DEFAULT '';
ALTER TABLE Reptiles ADD COLUMN morph TEXT NOT NULL DEFAULT '';
ALTER TABLE Reptiles ADD COLUMN age TEXT NOT NULL DEFAULT '';
ALTER TABLE Reptiles ADD COLUMN status TEXT NOT NULL DEFAULT 'healthy'
    CHECK (status IN ('healthy', 'shedding', 'checkup'));
ALTER TABLE Reptiles ADD COLUMN tagline TEXT NOT NULL DEFAULT '';
ALTER TABLE Reptiles ADD COLUMN about TEXT NOT NULL DEFAULT '';
ALTER TABLE Reptiles ADD COLUMN initials TEXT NOT NULL DEFAULT '';
ALTER TABLE Reptiles ADD COLUMN basking_temp REAL NOT NULL DEFAULT 0;
ALTER TABLE Reptiles ADD COLUMN cool_temp REAL NOT NULL DEFAULT 0;
ALTER TABLE Reptiles ADD COLUMN humidity REAL NOT NULL DEFAULT 0;
ALTER TABLE Reptiles ADD COLUMN feed_in_days INTEGER NOT NULL DEFAULT 0;
ALTER TABLE Reptiles ADD COLUMN weight_grams REAL NOT NULL DEFAULT 0;
ALTER TABLE Reptiles ADD COLUMN length_cm REAL NOT NULL DEFAULT 0;
ALTER TABLE Reptiles ADD COLUMN last_shed TEXT NOT NULL DEFAULT '';
ALTER TABLE Reptiles ADD COLUMN notes TEXT NOT NULL DEFAULT '[]'
    CHECK (json_valid(notes) AND json_type(notes) = 'array');

CREATE TABLE GrowthEntries (
    id TEXT PRIMARY KEY NOT NULL,
    reptile_id TEXT NOT NULL REFERENCES Reptiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    weight_grams REAL NOT NULL CHECK (weight_grams >= 0),
    length_cm REAL NOT NULL CHECK (length_cm >= 0),
    CHECK (date GLOB '????-??-??')
);

CREATE INDEX idx_growth_entries_reptile_date
    ON GrowthEntries(reptile_id, date);

CREATE TABLE FeedingEntries (
    id TEXT PRIMARY KEY NOT NULL,
    reptile_id TEXT NOT NULL REFERENCES Reptiles(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    amount INTEGER NOT NULL CHECK (amount > 0),
    mouse_size TEXT NOT NULL CHECK (mouse_size IN (
        'XS_PINKY', 'SM_PINKY', 'LG_PINKY', 'P_FUZZY', 'FUZZY',
        'SMALL', 'MEDIUM', 'LARGE', 'X_LARGE'
    )),
    powdered INTEGER NOT NULL CHECK (powdered IN (0, 1)),
    powder_kind TEXT CHECK (powder_kind IS NULL OR powder_kind = 'vitamin'),
    CHECK (powdered = 1 OR powder_kind IS NULL),
    CHECK (date GLOB '????-??-??')
);

CREATE INDEX idx_feeding_entries_reptile_date
    ON FeedingEntries(reptile_id, date);
