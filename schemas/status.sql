create table if not exists bereich
(
    id   int auto_increment
        primary key,
    name varchar(70) not null
);

create table if not exists hersteller
(
    id   int auto_increment
        primary key,
    name varchar(50) not null
);

create table if not exists kategorie
(
    id         int auto_increment
        primary key,
    name       varchar(70) not null,
    bereich_id int         not null,
    constraint kategorie_bereich_id_fk
        foreign key (bereich_id) references bereich (id)
);

create table if not exists objekttyp
(
    id   int auto_increment
        primary key,
    name varchar(50) not null
);

create table if not exists modell
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

create table if not exists person
(
    id       int auto_increment
        primary key,
    vorname  varchar(30) not null,
    nachname varchar(30) not null
);

create table if not exists standort
(
    id   int auto_increment
        primary key,
    name varchar(100) not null
);

create table if not exists status
(
    id   int auto_increment
        primary key,
    name varchar(50) not null
);

create table if not exists geraet
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

create table if not exists dokumente
(
    id             int auto_increment
        primary key,
    name           varchar(100)                        null,
    url            varchar(255)                        not null,
    geraete_id     int                                 not null,
    hochgeladen_am timestamp default CURRENT_TIMESTAMP null,
    constraint dokumente_geraet_inv_nr_fk
        foreign key (geraete_id) references geraet (inv_nr)
);

create or replace definer = root@`%` view geraete_View as
select `g`.`inv_nr`        AS `inv_nr`,
       `g`.`kaufdatum`     AS `kaufdatum`,
       `g`.`einkaufspreis` AS `einkaufspreis`,
       `g`.`qrcode`        AS `qrcode`,
       `s`.`name`          AS `Status`,
       `m`.`name`          AS `Modell`,
       `stand`.`name`      AS `Standort`,
       `b`.`name`          AS `Bereich`,
       `k`.`name`          AS `Kategorie`,
       `p`.`vorname`       AS `Verantwortlicher`
from ((((((`church_Inv_Sql`.`geraet` `g` join `church_Inv_Sql`.`status` `s`
           on ((`g`.`status_id` = `s`.`id`))) join `church_Inv_Sql`.`modell` `m`
          on ((`g`.`modell_id` = `m`.`id`))) join `church_Inv_Sql`.`standort` `stand`
         on ((`g`.`standort_id` = `stand`.`id`))) join `church_Inv_Sql`.`bereich` `b`
        on ((`g`.`bereich_id` = `b`.`id`))) join `church_Inv_Sql`.`kategorie` `k`
       on ((`g`.`kategorie_id` = `k`.`id`))) left join `church_Inv_Sql`.`person` `p`
      on ((`g`.`verantwortlicher_id` = `p`.`id`)));

