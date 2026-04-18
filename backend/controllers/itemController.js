const Item = require('../models/Item');

const getItems = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }];
    if (category && category !== 'All') query.category = category;
    if (minPrice || maxPrice) {
      query.pricePerDay = {};
      if (minPrice) query.pricePerDay.$gte = Number(minPrice);
      if (maxPrice) query.pricePerDay.$lte = Number(maxPrice);
    }
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Item.countDocuments(query);
    const items = await Item.find(query).populate('owner', 'name profileImage rating university').sort({ createdAt: -1 }).skip(skip).limit(Number(limit));
    res.json({ success: true, items, pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name profileImage rating university email');
    if (!item || !item.isActive) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createItem = async (req, res) => {
  try {
    const { title, description, category, listingType, pricePerDay, sellingPrice, availableFrom, availableTo, condition, tags } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ success: false, message: 'Title, description and category are required' });
    }

    const images = req.files ? req.files.map(f => `/uploads/${f.filename}`) : [];

    const itemData = {
      title,
      description,
      category,
      listingType: listingType || 'Rent',
      pricePerDay: pricePerDay ? Number(pricePerDay) : 0,
      sellingPrice: sellingPrice ? Number(sellingPrice) : 0,
      availableFrom: availableFrom || Date.now(),
      condition: condition || 'Good',
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      images,
      owner: req.user._id,
    };

    if (availableTo) {
      itemData.availableTo = availableTo;
    }

    const item = await Item.create(itemData);
    await item.populate('owner', 'name profileImage rating');

    res.status(201).json({ success: true, item });
  } catch (error) {
    console.error('Create item error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    const updates = req.body;
    if (req.files && req.files.length > 0) updates.images = req.files.map(f => `/uploads/${f.filename}`);
    const updated = await Item.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).populate('owner', 'name profileImage rating');
    res.json({ success: true, item: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    item.isActive = false;
    await item.save();
    res.json({ success: true, message: 'Item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyItems = async (req, res) => {
  try {
    const items = await Item.find({ owner: req.user._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getItems, getItem, createItem, updateItem, deleteItem, getMyItems };