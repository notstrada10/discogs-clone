INSERT INTO artists (name, description) VALUES
    ('The Beatles', 'Iconic British rock band from Liverpool, formed in 1960.'),
    ('Bob Dylan', 'American singer-songwriter and Nobel Prize winner, pioneer of folk rock.'),
    ('Wings', 'Rock band formed by Paul McCartney after the Beatles disbanded.');

INSERT INTO albums (artist_id, title, release_year, genre) VALUES
    (1, 'Abbey Road', 1969, 'Rock'),
    (1, 'Revolver', 1966, 'Rock'),
    (1, 'Sgt. Pepper''s Lonely Hearts Club Band', 1967, 'Psychedelic Rock'),
    (2, 'Highway 61 Revisited', 1965, 'Folk Rock'),
    (2, 'Blonde on Blonde', 1966, 'Folk Rock'),
    (2, 'Blood on the Tracks', 1975, 'Folk Rock'),
    (3, 'Band on the Run', 1973, 'Rock'),
    (3, 'Venus and Mars', 1975, 'Rock');
