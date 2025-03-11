create table hersteller
(
    id   int auto_increment
        primary key,
    name varchar(50) not null
);

INSERT INTO church_Inv_Sql.hersteller (id, name) VALUES (1, 'Sennheiser');
INSERT INTO church_Inv_Sql.hersteller (id, name) VALUES (2, 'Sony');
INSERT INTO church_Inv_Sql.hersteller (id, name) VALUES (3, 'Dpa');
