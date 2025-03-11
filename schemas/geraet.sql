create table geraet
(
    inv_nr              int auto_increment
        primary key,
    status_id           int            not null,
    geraetefoto_url     varchar(255)   null,
    modell_id           int            not null,
    serien_nr           int            null,
    kaufdatum           date           null,
    einkaufspreis       decimal(10, 2) null,
    standort_id         int            null,
    verantwortlicher_id int            null,
    bereich_id          int            not null,
    kategorie_id        int            null,
    qrcode              varchar(100)   null,
    constraint geraet_bereich_id_fk
        foreign key (bereich_id) references bereich (id),
    constraint geraet_kategorie_id_fk
        foreign key (kategorie_id) references kategorie (id),
    constraint geraet_modell_id_fk
        foreign key (modell_id) references modell (id),
    constraint geraet_person_id_fk
        foreign key (verantwortlicher_id) references person (id),
    constraint geraet_standort_id_fk
        foreign key (standort_id) references standort (id),
    constraint geraet_status_id_fk
        foreign key (status_id) references status (id)
);

INSERT INTO church_Inv_Sql.geraet (inv_nr, status_id, geraetefoto_url, modell_id, serien_nr, kaufdatum, einkaufspreis, standort_id, verantwortlicher_id, bereich_id, kategorie_id, qrcode) VALUES (1, 5, null, 2, 1600060, null, null, 2, null, 1, 4, null);
