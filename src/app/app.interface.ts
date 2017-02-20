export type estatusTarea = 'pendiente' | 'completada' | 'cancelada' | 'espera';

export interface IParametrosFiltrar {
    persona : string

    estatus : string
    proyecto : string
    palabra : string
}

