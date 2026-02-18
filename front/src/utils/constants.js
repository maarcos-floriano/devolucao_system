export const RESPONSAVEIS = [
  { value: 'Kell', label: 'Kell' },
  { value: 'Enzo', label: 'Enzo' },
  { value: 'Marcos', label: 'Marcos' },
  { value: 'Caique', label: 'Caique' },
  { value: 'Outro', label: 'Outro' },
];

export const ORIGENS = [
  { value: 'Mercado Livre', label: 'Mercado Livre' },
  { value: 'Shopee', label: 'Shopee' },
  { value: 'Correios', label: 'Correios' },
  { value: 'Mineiro Express', label: 'Mineiro Express' },
  { value: 'Pex', label: 'Pex' },
  { value: 'Outro', label: 'Outro' },
];

export const PROCESSADORES = {
  i5: [
    'i5 1ª Geração', 'i5 2ª Geração', 'i5 3ª Geração',
    'i5 4ª Geração', 'i5 5ª Geração', 'i5 6ª Geração',
    'i5 7ª Geração', 'i5 8ª Geração', 'i5 9ª Geração',
    'i5 10ª Geração', 'i5 11ª Geração'
  ],
  i7: [
    'i7 1ª Geração', 'i7 2ª Geração', 'i7 3ª Geração',
    'i7 4ª Geração', 'i7 6ª Geração',
    'i7 7ª Geração', 'i7 8ª Geração', 'i7 9ª Geração',
    'i7 10ª Geração', 'i7 11ª Geração'
  ],
  ryzen: [
    'R5 5500', 'R5 2ª - GPU', 'R5 5600GT', 'R5 7ª', 'R7 5700G'
  ]
};

export const MEMORIAS = {
  ddr3: ['2GB DDR3', '4GB DDR3', '8GB DDR3', '16GB DDR3'],
  ddr4: ['4GB DDR4', '8GB DDR4', '16GB DDR4', '32GB DDR4', '64GB DDR4']
};

export const ARMAZENAMENTOS = {
  ssd: [
    '120GB SSD', '240GB SSD', '256GB SSD', '480GB SSD',
    '512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD'
  ],
  nvme: [
    '120GB NVMe', '240GB NVMe', '256GB NVMe', '480GB NVMe',
    '512GB NVMe', '1TB NVMe', '2TB NVMe', '4TB NVMe', '8TB NVMe'
  ],
  hd: [
    '500GB HD', '1TB HD', '2TB HD', '4TB HD', '6TB HD', '8TB HD'
  ]
};

export const FONTES = {
  baixa: ['230W', '250W', '300W', '350W'],
  media: ['400W', '450W', '500W', '550W', '600W'],
  alta: ['650W', '700W', '750W', '800W', '850W', '1000W', '1200W']
};

export const MARCAS_MONITOR = [
  'Ultra', 'Tronos', 'BPC', 'Gandolfo', 'BRX', 'Maxtro', 'MNbox', 'VX PRO' 
];

export const PLACAS_MAE = [
  'Revenger-A320', 'BPC-A520M', 'BPC-H110M.2', 'Revenger-H310/B250',
  'BPC-H510M.2', 'BPC-H61-ITX-M2', 'BPC-H81M', 'XGAMING-H81G', 'BPC H310'
];


export const ORIGENS_DEVOLUCAO = [
  'Mercado Livre', 'Loggi', 'Correios', 'Shopee', 'Mineiro Express', 'Pex', 'Outro'
];

export const SKUS_PRODUTOS = {
  i5_2gen: [
    { cod: '001004586', 
    cpu: 'i5 2ª Geração', 
    ram: '16GB', 
    storage: 'SSD 512GB', 
    fonte: '230W', 
    gabinete: 'N110', 
    GPU: 'S/ GPU' 
    },
    { cod: '001004589',
      cpu: 'i5 2ª Geração', 
      ram: '8GB', 
      storage: 'SSD 512GB', 
      fonte: '230W', 
      gabinete: 'N110', 
      GPU: 'S/ GPU' 
    },
    { cod: '001004592',
      cpu: 'i5 2ª Geração', 
      ram: '16GB', 
      storage: 'SSD 240GB',
      fonte: '230W', 
      gabinete: 'N110', 
      GPU: 'S/ GPU'
    },
    { cod: '001004816',
      cpu: 'i5 2ª Geração', 
      ram: '16GB', 
      storage: 'SSD 1TB',
      fonte: '230W', 
      gabinete: 'N110', 
      GPU: 'S/ GPU'
    },
    { cod: '001004820',
      cpu: 'i5 2ª Geração', 
      ram: '16GB', 
      storage: 'SSD 120GB',
      fonte: '230W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    { cod: '001005435',
      cpu: 'i5 2ª Geração', 
      ram: '16GB', 
      storage: 'SSD 1TB',
      fonte: '300W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    { cod: '001005530',
      cpu: 'i5 2ª Geração', 
      ram: '8GB', 
      storage: 'SSD 512GB',
      fonte: '300W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    { cod: '001005569',
      cpu: 'i5 2ª Geração', 
      ram: '16GB', 
      storage: 'NVME 1TB',
      fonte: '230W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    { cod: '001005622',
      cpu: 'i5 2ª Geração', 
      ram: '16GB', 
      storage: 'SSD 512GB',
      fonte: '350W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    }
  ],
  i5_3gen: [
    {
      cod: '001004817',
      cpu: 'i5 3ª Geração', 
      ram: '16GB', 
      storage: 'SSD 1TB',
      fonte: '230W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    {
      cod: '001005436',
      cpu: 'i5 3ª Geração', 
      ram: '16GB', 
      storage: 'SSD 120GB',
      fonte: '230W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
  ],
  i5_4gen: [
    {
      cod: '001004821',
      cpu: 'i5 4ª Geração', 
      ram: '16GB', 
      storage: 'SSD 1TB',
      fonte: '230W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    {
      cod: '001005599',
      cpu: 'i5 4ª Geração', 
      ram: '16GB', 
      storage: '1TB',
      fonte: '350W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    {
      cod: '001005263',
      cpu: 'i5 4ª Geração', 
      ram: '16GB', 
      storage: 'SSD 512GB',
      fonte: '230W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    {
      cod: '001005531',
      cpu: 'i5 4ª Geração', 
      ram: '8GB', 
      storage: 'SSD 512GB',
      fonte: '230W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    {
      cod: '001005437',
      cpu: 'i5 4ª Geração', 
      ram: '8GB', 
      storage: 'SSD 512GB',
      fonte: '400W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    {
      cod: '001004812',
      cpu: 'i5 4ª Geração', 
      ram: '16GB', 
      storage: 'SSD 120GB',
      fonte: '230W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    }
  ],
  i5_6gen: [
    {
      cod: '001005623',
      cpu: 'i5 6ª Geração', 
      ram: '8GB', 
      storage: 'SSD 512GB',
      fonte: '350W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    {
      cod: '001005438',
      cpu: 'i5 6ª Geração', 
      ram: '16GB', 
      storage: 'SSD 1TB',
      fonte: '600W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    },
    {
      cod: '001005265',
      cpu: 'i5 6ª Geração', 
      ram: '16GB', 
      storage: 'SSD 512GB',
      fonte: '500W', 
      gabinete: 'N110',
      GPU: 'S/ GPU'
    }
  ],
  i5_7gen: [
  {
    "cod": "001004598",
    "cpu": "CORE I5 - 7TH",
    "ram": "16GB",
    "storage": "SSD 480 ou 512GB",
    "fonte": "500W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005267",
    "cpu": "CORE I5 - 7TH",
    "ram": "16GB",
    "storage": "SSD 512",
    "fonte": "230W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005268",
    "cpu": "CORE I5 - 7TH",
    "ram": "16GB",
    "storage": "SSD 480 ou 512GB",
    "fonte": "350W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005269",
    "cpu": "CORE I5 - 7TH",
    "ram": "16GB",
    "storage": "SSD 480 ou 512GB",
    "fonte": "750W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005270",
    "cpu": "CORE I5 - 7TH",
    "ram": "16GB",
    "storage": "SSD 1TB",
    "fonte": "500W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005271",
    "cpu": "CORE I5 - 7TH",
    "ram": "8GB",
    "storage": "SSD 1TB",
    "fonte": "350W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005292",
    "cpu": "CORE I5 - 7TH",
    "ram": "16GB",
    "storage": "SSD 1TB",
    "fonte": "350W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005440",
    "cpu": "CORE I5 - 7TH",
    "ram": "8GB",
    "storage": "SSD 480 ou 512GB",
    "fonte": "500W",
    "gabinete": "N/A",
    "GPU": "N/A"
  }
  ],
  i5_8gen: [
  {
    "cod": "001004600",
    "cpu": "CORE i5-8TH",
    "ram": "32GB",
    "storage": "SSD 1TB",
    "fonte": "500W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001004601",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 1TB",
    "fonte": "350W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001004602",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 480",
    "fonte": "750W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001004603",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 480",
    "fonte": "230W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001004724",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 480 ou 512GB",
    "fonte": "500 ou 550W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001004827",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 1TB NVME",
    "fonte": "600W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005273",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 1TB",
    "fonte": "750W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005275",
    "cpu": "CORE i5-8TH",
    "ram": "32GB",
    "storage": "SSD 1TB",
    "fonte": "750W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005441",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 256GB",
    "fonte": "750W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005442",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 480 ou 512GB",
    "fonte": "300 ou 350W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005444",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 120GB",
    "fonte": "350W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005600",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 1TB",
    "fonte": "500 ou 550W",
    "gabinete": "N/A",
    "GPU": "N/A"
  },
  {
    "cod": "001005604",
    "cpu": "CORE i5-8TH",
    "ram": "32GB",
    "storage": "SSD 1TB",
    "fonte": "500W",
    "gabinete": "N/A",
    "GPU": "PV 4GB-GTX750"
  },
  {
    "cod": "001005624",
    "cpu": "CORE i5-8TH",
    "ram": "16GB",
    "storage": "SSD 1TB NVME",
    "fonte": "500W",
    "gabinete": "N/A",
    "GPU": "PV-2GB-GT610"
  }
  ],
  i5_9gen: [
    {
      "cod": "001004596",
      "cpu": "CORE i5 - 9TH",
      "ram": "32GB",
      "storage": "SSD 1TB",
      "fonte": "350W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001004818",
      "cpu": "CORE i5 - 9TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "350W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005647",
      "cpu": "CORE i5 - 9TH",
      "ram": "16GB",
      "storage": "SSD 480GB",
      "fonte": "500W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005648",
      "cpu": "CORE i5 - 9TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "500W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005649",
      "cpu": "CORE i5 - 9TH",
      "ram": "32GB",
      "storage": "SSD 512GB",
      "fonte": "350W",
      "gabinete": "N/A",
      "GPU": "N/A"
    }
  ],
  i7_2gen: [
    {
      "cod": "001004587",
      "cpu": "CORE i7 - 2TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "230W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001004597",
      "cpu": "CORE i7 - 2TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "600W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001004721",
      "cpu": "CORE i7 - 2TH",
      "ram": "16GB",
      "storage": "SSD 480 ou 512GB",
      "fonte": "230W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005278",
      "cpu": "CORE i7 - 2TH",
      "ram": "16GB",
      "storage": "SSD 120",
      "fonte": "230W",
      "gabinete": "N/A",
      "GPU": "N/A"
    }
  ],
  i7_3gen: [
    {
      "cod": "001004591",
      "cpu": "CORE i7 - 3TH",
      "ram": "16GB",
      "storage": "SSD 480 ou 512GB",
      "fonte": "230W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001004729",
      "cpu": "CORE i7 - 3TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "600W",
      "gabinete": "N/A",
      "GPU": "PV-2GB-GT610"
    },
    {
      "cod": "001005280",
      "cpu": "CORE i7 - 3TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "230W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005532",
      "cpu": "CORE i7 - 3TH",
      "ram": "16GB",
      "storage": "SSD 480GB",
      "fonte": "300W",
      "gabinete": "N/A",
      "GPU": "N/A"
    }
  ],
  i7_4gen: [
    {
      "cod": "00100458",
      "cpu": "CORE i7 - 4TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "750W",
      "gabinete": "N/A",
      "GPU": "PV-2GB-GT610"
    },
    {
      "cod": "00100459",
      "cpu": "CORE i7 - 4TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "600W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "00100472",
      "cpu": "CORE i7 - 4TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "230W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "00100524",
      "cpu": "CORE i7 - 4TH",
      "ram": "16GB",
      "storage": "SSD 480 ou 512GB",
      "fonte": "230W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "00100545",
      "cpu": "CORE i7 - 4TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "500W",
      "gabinete": "N/A",
      "GPU": "N/A"
    }
  ],
  i7_6gen: [
    {
      "cod": "001005240",
      "cpu": "CORE i7 - 6TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "750W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005287",
      "cpu": "CORE i7 - 6TH",
      "ram": "16GB",
      "storage": "SSD 512",
      "fonte": "350W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005451",
      "cpu": "CORE i7 - 6TH",
      "ram": "16GB",
      "storage": "SSD 256GB",
      "fonte": "550W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005452",
      "cpu": "CORE i7 - 6TH",
      "ram": "32GB",
      "storage": "SSD 480",
      "fonte": "600W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005607",
      "cpu": "CORE i7 - 6TH",
      "ram": "16GB",
      "storage": "SSD 480GB",
      "fonte": "500W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005656",
      "cpu": "CORE i7 - 6TH",
      "ram": "32GB",
      "storage": "SSD 480",
      "fonte": "750W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005657",
      "cpu": "CORE i7 - 6TH",
      "ram": "16GB",
      "storage": "SSD 480GB",
      "fonte": "500W",
      "gabinete": "N/A",
      "GPU": "PV-2GB-GT610"
    }
  ],
  i7_8gen: [
    {
      "cod": "001005239",
      "cpu": "CORE i7 - 8TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "550W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005288",
      "cpu": "CORE i7 - 8TH",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "550W",
      "gabinete": "N/A",
      "GPU": "PV-2GB-GT730"
    },
    {
      "cod": "001005621",
      "cpu": "CORE i7 - 8TH",
      "ram": "32GB",
      "storage": "SSD 512",
      "fonte": "750W",
      "gabinete": "N/A",
      "GPU": "N/A"
    }
  ],
  ryzen_5: [
    {
      "cod": "001005241",
      "cpu": "RYZEN 5TH - 5500",
      "ram": "32GB",
      "storage": "SSD 1TB",
      "fonte": "600W",
      "gabinete": "N/A",
      "GPU": "PV-8GB-RTX-2060S"
    },
    {
      "cod": "001005474",
      "cpu": "RYZEN 5TH - 5500",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "500W",
      "gabinete": "N/A",
      "GPU": "PV-2GB-GT730"
    },
    {
      "cod": "001005529",
      "cpu": "RYZEN 7TH - 5700G",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "500W",
      "gabinete": "N/A",
      "GPU": "PV 2GB-GT730"
    },
    {
      "cod": "001005533",
      "cpu": "RYZEN 5TH - 5500",
      "ram": "32GB",
      "storage": "SSD 1TB",
      "fonte": "500W",
      "gabinete": "N/A",
      "GPU": "N/A"
    },
    {
      "cod": "001005594",
      "cpu": "RYZEN 5TH - 5500",
      "ram": "16GB",
      "storage": "SSD 1TB",
      "fonte": "650W",
      "gabinete": "N/A",
      "GPU": "PV 4GB-GT740"
    }
  ]
};

// Função para buscar SKU por código
export const buscarSKUPorCodigo = (codigo) => {
  const codigoStr = String(codigo).trim();
  
  // Percorre todas as categorias
  for (const categoria in SKUS_PRODUTOS) {
    const produto = SKUS_PRODUTOS[categoria].find(item => item.cod === codigoStr);
    if (produto) {
      return produto;
    }
  }
  
  return null; // Não encontrado
};

// Função para listar todos os SKUs
export const listarTodosSKUs = () => {
  const todosSKUs = [];
  
  for (const categoria in SKUS_PRODUTOS) {
    todosSKUs.push(...SKUS_PRODUTOS[categoria]);
  }
  
  return todosSKUs.sort((a, b) => a.cod.localeCompare(b.cod));
};

// Função para buscar SKUs por termo (código, CPU, RAM, etc.)
export const buscarSKUsPorTermo = (termo) => {
  if (!termo || termo.trim() === '') return [];
  
  const termoLower = termo.toLowerCase().trim();
  const resultados = [];
  
  for (const categoria in SKUS_PRODUTOS) {
    const correspondentes = SKUS_PRODUTOS[categoria].filter(item => 
      item.cod.toLowerCase().includes(termoLower) ||
      item.cpu.toLowerCase().includes(termoLower) ||
      item.ram.toLowerCase().includes(termoLower) ||
      item.storage.toLowerCase().includes(termoLower) ||
      item.fonte.toLowerCase().includes(termoLower)
    );
    
    resultados.push(...correspondentes);
  }
  
  return resultados.slice(0, 20); // Limita a 20 resultados
};