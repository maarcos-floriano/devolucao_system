const PAGE_STYLE = `
  @page { size: 100mm 30mm; margin: 0; padding: 0; }
  html, body {
    width: 100mm;
    height: 30mm;
    margin: 0;
    padding: 0;
  }
  body {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
    text-align: center;
  }
`;

const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const openPrintWindow = (title, bodyHtml, style = '') => {
  const janela = window.open('', '_blank');
  if (!janela) {
    throw new Error('Pop-up de impressao bloqueado pelo navegador');
  }

  janela.document.write(`
    <html>
      <head>
        <title>${escapeHtml(title)}</title>
        <style>${PAGE_STYLE}${style}</style>
      </head>
      <body onload="window.print(); window.close();">
        ${bodyHtml}
      </body>
    </html>
  `);
  janela.document.close();
};

export const printDevolucaoLabel = (devolucaoData) => {
  const style = `
    body { font-size: 20px; }
    .etiqueta {
      width: 100%;
      padding: 0 10px;
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
      box-sizing: border-box;
    }
    .etiqueta h1 { margin: 0; font-size: 50px; line-height: 1; }
    .etiqueta div { margin-top: 5px; font-size: 20px; }
  `;

  openPrintWindow(
    'Etiqueta Devolucao',
    `<div class="etiqueta">
      <h1>${escapeHtml(devolucaoData.id || 'NOVO')}</h1>
      <div>
        ${escapeHtml(devolucaoData.cliente || 'Cliente nao especificado')}<br>
        ${escapeHtml(devolucaoData.origem || 'Origem nao especificada')}
      </div>
    </div>`,
    style
  );
};

export const printMaquinaLabel = (maquinaData) => {
  const style = `
    body { font-size: 20px; }
    .etiqueta {
      width: 95mm;
      height: 25mm;
      border: 2px solid #000;
      padding: 5px;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .info-principal {
      flex: 1;
      border-right: 1px solid #000;
      padding-right: 10px;
    }
    .info-secundaria {
      flex: 1;
      padding-left: 10px;
      font-size: 16px;
    }
    h1 { margin: 0; font-size: 24px; }
  `;

  openPrintWindow(
    'Etiqueta Maquina',
    `<div class="etiqueta">
      <div class="info-principal">
        <h1>${escapeHtml(maquinaData.codigo)}</h1>
      </div>
      <div class="info-secundaria">${escapeHtml(maquinaData.config)}</div>
    </div>`,
    style
  );
};
