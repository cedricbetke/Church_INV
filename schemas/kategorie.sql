create table kategorie
(
    id         int auto_increment
        primary key,
    name       varchar(70) not null,
    bereich_id int         not null,
    constraint kategorie_bereich_id_fk
        foreign key (bereich_id) references bereich (id)
);

INSERT INTO church_Inv_Sql.kategorie (id, name, bereich_id) VALUES (1, 'Audio', 1);
INSERT INTO church_Inv_Sql.kategorie (id, name, bereich_id) VALUES (2, 'GFX', 1);
INSERT INTO church_Inv_Sql.kategorie (id, name, bereich_id) VALUES (3, 'Licht', 1);
INSERT INTO church_Inv_Sql.kategorie (id, name, bereich_id) VALUES (4, 'Video', 1);
