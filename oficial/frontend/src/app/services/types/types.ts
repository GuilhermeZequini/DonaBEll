// tenho que retornar a interface completa com esses dados
//"id": 10,
//	"name": "Oma Ortiz",
//	"email": "slarson@example.org",
//	"data_cadastro": "2026-01-24T18:03:07.000000Z",
//	"data_atualizacao": "2026-01-24T18:03:07.000000Z"
//}


export interface Usuario{
  id?: number;
  name: string;
  email: string;
  data_cadastro?: string;
  data_atualizacao?: string;
}

export interface PaginacaoResponse {
  data: Usuario[];
  infos: {
    total_users: number;
    per_page?: number;
    current_page?: number;
    total_pages?: number;
  };
}

