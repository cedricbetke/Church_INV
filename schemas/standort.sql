create table standort
(
    id   int auto_increment
        primary key,
    name varchar(100) not null
);

INSERT INTO church_Inv_Sql.standort (id, name) VALUES (1, 'Gemeindesaal');
INSERT INTO church_Inv_Sql.standort (id, name) VALUES (2, 'Studio');
INSERT INTO church_Inv_Sql.standort (id, name) VALUES (3, 'Videoregie');
