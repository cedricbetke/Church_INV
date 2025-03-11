create table objekttyp
(
    id   int auto_increment
        primary key,
    name varchar(50) not null
);

INSERT INTO church_Inv_Sql.objekttyp (id, name) VALUES (1, 'Videokamera');
INSERT INTO church_Inv_Sql.objekttyp (id, name) VALUES (2, 'Mikrofon');
INSERT INTO church_Inv_Sql.objekttyp (id, name) VALUES (3, 'Headset Mikrofon');
