const RAW_ALLOWED_MACHINE_CONFIGS = [
  ['i5 10ª Geração', '16GB', '480GB SSD', '550W'],
  ['i5 2ª Geração', '16GB', '1TB NVMe', '230W'],
  ['i5 2ª Geração', '16GB', '1TB NVMe', '250W'],
  ['i5 2ª Geração', '16GB', '120GB SSD', '230W'],
  ['i5 2ª Geração', '16GB', '1TB SSD', '200W'],
  ['i5 2ª Geração', '16GB', '1TB SSD', '230W'],
  ['i5 2ª Geração', '16GB', '1TB SSD', '250W'],
  ['i5 2ª Geração', '16GB', '1TB SSD', '300W'],
  ['i5 2ª Geração', '16GB', '240GB SSD', '230W'],
  ['i5 2ª Geração', '16GB', '480GB SSD', '230W'],
  ['i5 2ª Geração', '16GB', '480GB SSD', '300W'],
  ['i5 2ª Geração', '16GB', '480GB SSD', '350W'],
  ['i5 2ª Geração', '16GB', '512GB SSD', '300W'],
  ['i5 2ª Geração', '16GB', '512GB SSD', '350W'],
  ['i5 2ª Geração', '16GB', '480GB SSD', '500W'],
  ['i5 2ª Geração', '16GB', '480GB SSD', '550W'],
  ['i5 2ª Geração', '16GB', '512GB SSD', '500W'],
  ['i5 2ª Geração', '16GB', '512GB SSD', '550W'],
  ['i5 2ª Geração', '16GB', '512GB SSD', '230W'],
  ['i5 2ª Geração', '8GB', '120GB SSD', '230W'],
  ['i5 2ª Geração', '8GB', '480GB SSD', '230W'],
  ['i5 2ª Geração', '8GB', '512GB SSD', '230W'],
  ['i5 2ª Geração', '8GB', '512GB SSD', '300W'],
  ['i5 3ª Geração', '16GB', '120GB SSD', '230W'],
  ['i5 3ª Geração', '16GB', '1TB SSD', '230W'],
  ['i5 3ª Geração', '16GB', '1TB SSD', '300W'],
  ['i5 3ª Geração', '16GB', '240GB SSD', '230W'],
  ['i5 3ª Geração', '16GB', '480GB SSD', '230W'],
  ['i5 3ª Geração', '16GB', '512GB SSD', '230W'],
  ['i5 4ª Geração', '16GB', '120GB SSD', '230W'],
  ['i5 4ª Geração', '16GB', '1TB SSD', '230W'],
  ['i5 4ª Geração', '16GB', '1TB SSD', '500W'],
  ['i5 4ª Geração', '16GB', '1TB SSD', '350W'],
  ['i5 4ª Geração', '16GB', '1TB NVMe', '350W'],
  ['i5 4ª Geração', '16GB', '480GB SSD', '230W'],
  ['i5 4ª Geração', '16GB', '512GB SSD', '230W'],
  ['i5 4ª Geração', '8GB', '480GB SSD', '230W'],
  ['i5 4ª Geração', '8GB', '512GB SSD', '230W'],
  ['i5 4ª Geração', '8GB', '480GB SSD', '400W'],
  ['i5 4ª Geração', '8GB', '512GB SSD', '400W'],
  ['i5 6ª Geração', '16GB', '1TB SSD', '600W'],
  ['i5 6ª Geração', '16GB', '240GB SSD', '200W'],
  ['i5 6ª Geração', '16GB', '240GB SSD', '230W'],
  ['i5 6ª Geração', '16GB', '256GB SSD', '200W'],
  ['i5 6ª Geração', '16GB', '256GB SSD', '230W'],
  ['i5 6ª Geração', '16GB', '480GB SSD', '500W'],
  ['i5 6ª Geração', '16GB', '480GB SSD', '550W'],
  ['i5 6ª Geração', '16GB', '512GB SSD', '500W'],
  ['i5 6ª Geração', '16GB', '512GB SSD', '550W'],
  ['i5 6ª Geração', '16GB', '480GB SSD', '700W'],
  ['i5 6ª Geração', '16GB', '480GB SSD', '750W'],
  ['i5 6ª Geração', '16GB', '512GB SSD', '700W'],
  ['i5 6ª Geração', '16GB', '512GB SSD', '750W'],
  ['i5 6ª Geração', '32GB', '1TB NVMe', '600W'],
  ['i5 6ª Geração', '8GB', '480GB SSD', '350W'],
  ['i5 6ª Geração', '8GB', '512GB SSD', '350W'],
  ['i5 7ª Geração', '16GB', '1TB SSD', '300W'],
  ['i5 7ª Geração', '16GB', '1TB SSD', '350W'],
  ['i5 7ª Geração', '16GB', '1TB SSD', '500W'],
  ['i5 7ª Geração', '16GB', '480GB SSD', '350W'],
  ['i5 7ª Geração', '16GB', '480GB SSD', '500W'],
  ['i5 7ª Geração', '16GB', '480GB SSD', '750W'],
  ['i5 7ª Geração', '16GB', '512GB SSD', '350W'],
  ['i5 7ª Geração', '16GB', '512GB SSD', '500W'],
  ['i5 7ª Geração', '16GB', '512GB SSD', '750W'],
  ['i5 7ª Geração', '16GB', '512GB SSD', '230W'],
  ['i5 7ª Geração', '8GB', '1TB SSD', '350W'],
  ['i5 7ª Geração', '8GB', '480GB SSD', '500W'],
  ['i5 7ª Geração', '8GB', '512GB SSD', '500W'],
  ['i5 8ª Geração', '16GB', '512GB SSD', '500W'],
  ['i5 8ª Geração', '16GB', '512GB SSD', '550W'],
  ['i5 8ª Geração', '16GB', '120GB SSD', '350W'],
  ['i5 8ª Geração', '16GB', '1TB NVMe', '550W'],
  ['i5 8ª Geração', '16GB', '1TB NVMe', '600W'],
  ['i5 8ª Geração', '16GB', '1TB NVMe', '500W'],
  ['i5 8ª Geração', '16GB', '1TB SSD', '300W'],
  ['i5 8ª Geração', '16GB', '1TB SSD', '350W'],
  ['i5 8ª Geração', '16GB', '1TB SSD', '500W'],
  ['i5 8ª Geração', '16GB', '1TB SSD', '550W'],
  ['i5 8ª Geração', '16GB', '1TB SSD', '750W'],
  ['i5 8ª Geração', '16GB', '256GB SSD', '750W'],
  ['i5 8ª Geração', '16GB', '480GB SSD', '230W'],
  ['i5 8ª Geração', '16GB', '480GB SSD', '750W'],
  ['i5 8ª Geração', '16GB', '480GB SSD', '500W'],
  ['i5 8ª Geração', '16GB', '480GB SSD', '550W'],
  ['i5 8ª Geração', '16GB', '480GB SSD', '600W'],
  ['i5 8ª Geração', '16GB', '480GB SSD', '650W'],
  ['i5 8ª Geração', '16GB', '480GB SSD', '300W'],
  ['i5 8ª Geração', '16GB', '480GB SSD', '350W'],
  ['i5 8ª Geração', '16GB', '512GB SSD', '500W'],
  ['i5 8ª Geração', '16GB', '512GB SSD', '550W'],
  ['i5 8ª Geração', '16GB', '512GB SSD', '600W'],
  ['i5 8ª Geração', '16GB', '512GB SSD', '650W'],
  ['i5 8ª Geração', '16GB', '512GB SSD', '300W'],
  ['i5 8ª Geração', '16GB', '512GB SSD', '350W'],
  ['i5 8ª Geração', '32GB', '1TB SSD', '500W'],
  ['i5 8ª Geração', '32GB', '1TB NVMe', '550W'],
  ['i5 8ª Geração', '32GB', '1TB SSD', '750W'],
  ['i5 8ª Geração', '32GB', '480GB SSD', '350W'],
  ['i5 8ª Geração', '32GB', '512GB SSD', '550W'],
  ['i5 9ª Geração', '16GB', '1TB SSD', '350W'],
  ['i5 9ª Geração', '16GB', '1TB SSD', '500W'],
  ['i5 9ª Geração', '16GB', '1TB SSD', '600W'],
  ['i5 9ª Geração', '16GB', '480GB SSD', '500W'],
  ['i5 9ª Geração', '16GB', '480GB SSD', '550W'],
  ['i5 9ª Geração', '16GB', '480GB SSD', '700W'],
  ['i5 9ª Geração', '16GB', '480GB SSD', '750W'],
  ['i5 9ª Geração', '16GB', '512GB SSD', '500W'],
  ['i5 9ª Geração', '16GB', '512GB SSD', '550W'],
  ['i5 9ª Geração', '16GB', '512GB SSD', '700W'],
  ['i5 9ª Geração', '16GB', '512GB SSD', '750W'],
  ['i5 9ª Geração', '32GB', '1TB SSD', '350W'],
  ['i5 9ª Geração', '32GB', '512GB SSD', '350W'],
  ['i5 9ª Geração', '32GB', '1TB SSD', '750W'],
  ['i5 9ª Geração', '32GB', '1TB NVMe', '750W'],
  ['i7 2ª Geração', '16GB', '480GB SSD', '500W'],
  ['i7 2ª Geração', '16GB', '480GB SSD', '550W'],
  ['i7 2ª Geração', '16GB', '512GB SSD', '500W'],
  ['i7 2ª Geração', '16GB', '512GB SSD', '550W'],
  ['i7 2ª Geração', '16GB', '120GB SSD', '230W'],
  ['i7 2ª Geração', '16GB', '1TB SSD', '600W'],
  ['i7 2ª Geração', '16GB', '240GB SSD', '230W'],
  ['i7 2ª Geração', '16GB', '256GB SSD', '230W'],
  ['i7 2ª Geração', '16GB', '480GB SSD', '300W'],
  ['i7 2ª Geração', '16GB', '480GB SSD', '350W'],
  ['i7 2ª Geração', '16GB', '512GB SSD', '300W'],
  ['i7 2ª Geração', '16GB', '512GB SSD', '350W'],
  ['i7 2ª Geração', '16GB', '480GB SSD', '230W'],
  ['i7 2ª Geração', '16GB', '512GB SSD', '230W'],
  ['i7 2ª Geração', '16GB', '512GB SSD', '750W'],
  ['i7 2ª Geração', '16GB', '1TB SSD', '230W'],
  ['i7 2ª Geração', '16GB', '1TB NVMe', '230W'],
  ['i7 3ª Geração', '16GB', '2TB HD', '230W'],
  ['i7 3ª Geração', '16GB', '1TB SSD', '230W'],
  ['i7 3ª Geração', '16GB', '1TB SSD', '300W'],
  ['i7 3ª Geração', '16GB', '1TB SSD', '500W'],
  ['i7 3ª Geração', '16GB', '1TB SSD', '550W'],
  ['i7 3ª Geração', '16GB', '1TB SSD', '600W'],
  ['i7 3ª Geração', '16GB', '480GB SSD', '230W'],
  ['i7 3ª Geração', '16GB', '480GB SSD', '500W'],
  ['i7 3ª Geração', '16GB', '480GB SSD', '550W'],
  ['i7 3ª Geração', '16GB', '512GB SSD', '230W'],
  ['i7 3ª Geração', '16GB', '512GB SSD', '500W'],
  ['i7 3ª Geração', '16GB', '512GB SSD', '550W'],
  ['i7 3ª Geração', '16GB', '960GB SSD', '500W'],
  ['i7 3ª Geração', '16GB', '960GB SSD', '550W'],
  ['i7 4ª Geração', '16GB', '1TB SSD', '230W'],
  ['i7 4ª Geração', '16GB', '1TB SSD', '500W'],
  ['i7 4ª Geração', '16GB', '1TB SSD', '550W'],
  ['i7 4ª Geração', '16GB', '1TB SSD', '600W'],
  ['i7 4ª Geração', '16GB', '1TB SSD', '750W'],
  ['i7 4ª Geração', '16GB', '240GB SSD', '200W'],
  ['i7 4ª Geração', '16GB', '240GB SSD', '230W'],
  ['i7 4ª Geração', '16GB', '256GB SSD', '200W'],
  ['i7 4ª Geração', '16GB', '256GB SSD', '230W'],
  ['i7 4ª Geração', '16GB', '480GB SSD', '550W'],
  ['i7 4ª Geração', '16GB', '480GB SSD', '500W'],
  ['i7 4ª Geração', '16GB', '480GB SSD', '750W'],
  ['i7 4ª Geração', '16GB', '480GB SSD', '230W'],
  ['i7 4ª Geração', '16GB', '480GB SSD', '300W'],
  ['i7 4ª Geração', '16GB', '480GB SSD', '350W'],
  ['i7 4ª Geração', '16GB', '512GB SSD', '230W'],
  ['i7 4ª Geração', '16GB', '512GB SSD', '300W'],
  ['i7 4ª Geração', '16GB', '512GB SSD', '350W'],
  ['i7 6ª Geração', '16GB', '1TB SSD', '600W'],
  ['i7 6ª Geração', '16GB', '1TB SSD', '750W'],
  ['i7 6ª Geração', '16GB', '256GB SSD', '550W'],
  ['i7 6ª Geração', '16GB', '480GB SSD', '500W'],
  ['i7 6ª Geração', '16GB', '480GB SSD', '550W'],
  ['i7 6ª Geração', '16GB', '512GB SSD', '500W'],
  ['i7 6ª Geração', '16GB', '512GB SSD', '550W'],
  ['i7 6ª Geração', '16GB', '512GB SSD', '350W'],
  ['i7 6ª Geração', '32GB', '480GB SSD', '600W'],
  ['i7 6ª Geração', '32GB', '480GB SSD', '750W'],
  ['i7 8ª Geração', '16GB', '1TB SSD', '550W'],
  ['i7 8ª Geração', '16GB', '240GB SSD', '500W'],
  ['i7 8ª Geração', '16GB', '240GB SSD', '550W'],
  ['i7 8ª Geração', '16GB', '256GB SSD', '500W'],
  ['i7 8ª Geração', '16GB', '256GB SSD', '550W'],
  ['i7 8ª Geração', '16GB', '480GB SSD', '550W'],
  ['i7 8ª Geração', '16GB', '480GB SSD', '750W'],
  ['i7 8ª Geração', '16GB', '960GB SSD', '300W'],
  ['i7 8ª Geração', '16GB', '960GB SSD', '350W'],
  ['i7 8ª Geração', '32GB', '1TB SSD', '600W'],
  ['i7 8ª Geração', '32GB', '512GB SSD', '750W'],
];

export const ALLOWED_MACHINE_CONFIGS = RAW_ALLOWED_MACHINE_CONFIGS.map(([processador, memoria, armazenamento, fonte]) => ({
  processador,
  memoria,
  armazenamento,
  fonte,
}));

const MACHINE_FIELDS = ['processador', 'memoria', 'armazenamento', 'fonte'];

const matchesSelection = (config, selection) => (
  MACHINE_FIELDS.every((field) => !selection[field] || config[field] === selection[field])
);

const uniqueSorted = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b, 'pt-BR', { numeric: true }));

export const getAllowedOptions = (selection = {}) => ({
  processadores: uniqueSorted(ALLOWED_MACHINE_CONFIGS.map((config) => config.processador)),
  memorias: uniqueSorted(
    ALLOWED_MACHINE_CONFIGS
      .filter((config) => matchesSelection(config, { processador: selection.processador }))
      .map((config) => config.memoria)
  ),
  armazenamentos: uniqueSorted(
    ALLOWED_MACHINE_CONFIGS
      .filter((config) => matchesSelection(config, {
        processador: selection.processador,
        memoria: selection.memoria,
      }))
      .map((config) => config.armazenamento)
  ),
  fontes: uniqueSorted(
    ALLOWED_MACHINE_CONFIGS
      .filter((config) => matchesSelection(config, {
        processador: selection.processador,
        memoria: selection.memoria,
        armazenamento: selection.armazenamento,
      }))
      .map((config) => config.fonte)
  ),
});

export const sanitizeMachineConfig = (selection = {}) => {
  const nextSelection = { ...selection };
  const options = getAllowedOptions(nextSelection);

  if (nextSelection.processador && !options.processadores.includes(nextSelection.processador)) {
    nextSelection.processador = '';
  }

  const memoryOptions = getAllowedOptions(nextSelection).memorias;
  if (nextSelection.memoria && !memoryOptions.includes(nextSelection.memoria)) {
    nextSelection.memoria = '';
  }

  const storageOptions = getAllowedOptions(nextSelection).armazenamentos;
  if (nextSelection.armazenamento && !storageOptions.includes(nextSelection.armazenamento)) {
    nextSelection.armazenamento = '';
  }

  const powerOptions = getAllowedOptions(nextSelection).fontes;
  if (nextSelection.fonte && !powerOptions.includes(nextSelection.fonte)) {
    nextSelection.fonte = '';
  }

  return nextSelection;
};

export const isMachineConfigAllowed = (selection = {}) => (
  ALLOWED_MACHINE_CONFIGS.some((config) => MACHINE_FIELDS.every((field) => config[field] === selection[field]))
);
