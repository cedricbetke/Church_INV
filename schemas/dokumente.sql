create table dokumente
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

