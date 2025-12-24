export const RESPONSAVEIS = [
  { value: 'Kell', label: 'Kell' },
  { value: 'Enzo', label: 'Enzo' },
  { value: 'Marcos', label: 'Marcos' },
  { value: 'Jimmy', label: 'Jimmy' },
  { value: 'Matheus', label: 'Matheus' },
  { value: 'Outro', label: 'Outro' },
];

export const ORIGENS = [
  { value: 'Mercado Livre', label: 'Mercado Livre' },
  { value: 'Shopee', label: 'Shopee' },
  { value: 'Correios', label: 'Correios' },
  { value: 'Mineiro Express', label: 'Mineiro Express' },
  { value: 'Outro', label: 'Outro' },
];

export const PROCESSADORES = {
  i3: [
    'i3 1ª Geração', 'i3 2ª Geração', 'i3 3ª Geração',
    'i3 4ª Geração', 'i3 5ª Geração', 'i3 6ª Geração',
    'i3 7ª Geração', 'i3 8ª Geração', 'i3 9ª Geração',
    'i3 10ª Geração', 'i3 11ª Geração', 'i3 12ª Geração',
    'i3 13ª Geração', 'i3 14ª Geração'
  ],
  i5: [
    'i5 1ª Geração', 'i5 2ª Geração', 'i5 3ª Geração',
    'i5 4ª Geração', 'i5 5ª Geração', 'i5 6ª Geração',
    'i5 7ª Geração', 'i5 8ª Geração', 'i5 9ª Geração',
    'i5 10ª Geração', 'i5 11ª Geração', 'i5 12ª Geração',
    'i5 13ª Geração', 'i5 14ª Geração'
  ],
  i7: [
    'i7 1ª Geração', 'i7 2ª Geração', 'i7 3ª Geração',
    'i7 4ª Geração', 'i7 5ª Geração', 'i7 6ª Geração',
    'i7 7ª Geração', 'i7 8ª Geração', 'i7 9ª Geração',
    'i7 10ª Geração', 'i7 11ª Geração', 'i7 12ª Geração',
    'i7 13ª Geração', 'i7 14ª Geração'
  ],
  i9: [
    'i9 7ª Geração (X-Series)', 'i9 8ª Geração', 'i9 9ª Geração',
    'i9 10ª Geração', 'i9 11ª Geração', 'i9 12ª Geração',
    'i9 13ª Geração', 'i9 14ª Geração'
  ],
  ryzen: [
    'R5 2ª', 'R5 2ª - GPU', 'R5 5ª', 'R5 7ª'
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
  'Ultra', 'Tronos', 'BPC', 'Gandolfo', 'BRX', 'Maxtro', 'MNbox'
];

export const PLACAS_MAE = [
  'Revenger-A320', 'BPC-A520M', 'BPC-H110M.2', 'Revenger-H310/B250',
  'BPC-H510M.2', 'BPC-H61-ITX-M2', 'BPC-H81M', 'XGAMING-H81G', 'BPC H310'
];

export const HARDWARE_RETIRADA = {
  placas: PLACAS_MAE,
  processadores: [...PROCESSADORES.i5, ...PROCESSADORES.i7, ...PROCESSADORES.ryzen],
  armazenamento: [...ARMAZENAMENTOS.ssd, ...ARMAZENAMENTOS.nvme, ...ARMAZENAMENTOS.hd],
  fontes: [...FONTES.baixa, ...FONTES.media, ...FONTES.alta],
  outros: ['Cooler']
};

export const ORIGENS_DEVOLUCAO = [
  'Mercado Livre', 'Loggi', 'Correios', 'Shopee', 'Mineiro Express'
];