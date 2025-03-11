create table modell
(
    id            int auto_increment
        primary key,
    name          varchar(100) not null,
    hersteller_id int          not null,
    objekttyp_id  int          not null,
    constraint modell_hersteller_id_fk
        foreign key (hersteller_id) references hersteller (id),
    constraint modell_objekttyp_id_fk
        foreign key (objekttyp_id) references objekttyp (id)
);

INSERT INTO church_Inv_Sql.modell (id, name, hersteller_id, objekttyp_id) VALUES (1, 'DPA 4166-OL-F-F00-LH', 3, 3);
INSERT INTO church_Inv_Sql.modell (id, name, hersteller_id, objekttyp_id) VALUES (2, 'PWX-FS5', 2, 1);
