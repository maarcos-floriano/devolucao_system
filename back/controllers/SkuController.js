const SkuCatalog = require('../models/SkuCatalog');

class SkuController {
  static async findAll(req, res) {
    try {
      const { tipo } = req.params;
      const { search = '' } = req.query;
      const data = await SkuCatalog.findAll(tipo, search.toString());

      return res.json({ success: true, data });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { tipo } = req.params;
      const { sku, codigo, role } = req.body;

      if (role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Apenas administrador pode criar SKU' });
      }

      if (!sku || !codigo) {
        return res.status(400).json({ success: false, error: 'SKU e código são obrigatórios' });
      }

      const created = await SkuCatalog.create(tipo, { sku, codigo });
      return res.status(201).json({ success: true, data: created });
    } catch (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = SkuController;
