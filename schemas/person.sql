create table person
(
    id       int auto_increment
        primary key,
    vorname  varchar(30) not null,
    nachname varchar(30) not null
);

INSERT INTO church_Inv_Sql.person (id, vorname, nachname) VALUES (1, 'Cedric', 'Betke');
INSERT INTO church_Inv_Sql.person (id, vorname, nachname) VALUES (2, 'John', 'Görzen');
INSERT INTO church_Inv_Sql.person (id, vorname, nachname) VALUES (3, 'Sascha', 'Siemens');
