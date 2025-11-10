import express from 'express';
import db from './db.js';

const router = express.Router();

// 获取楼层统计信息
router.get('/floors', async (req, res) => {
  try {
    const [floors] = await db.query(`
      SELECT 
        floor,
        COUNT(*) as total_units,
        SUM(CASE WHEN status='available' THEN 1 ELSE 0 END) as available,
        SUM(CASE WHEN status='occupied' THEN 1 ELSE 0 END) as occupied,
        SUM(CASE WHEN status='reserved' THEN 1 ELSE 0 END) as reserved,
        SUM(area) as total_area,
        SUM(CASE WHEN status='available' THEN area ELSE 0 END) as available_area
      FROM space_units
      GROUP BY floor
      ORDER BY floor
    `);
    
    res.json(floors);
  } catch (error) {
    console.error('获取楼层信息失败:', error);
    res.status(500).json({ message: '获取失败' });
  }
});

// 获取指定楼层的空间单元
router.get('/floors/:floor/units', async (req, res) => {
  try {
    const { floor } = req.params;
    const [units] = await db.query(
      'SELECT * FROM space_units WHERE floor = ? ORDER BY unit_number',
      [floor]
    );
    
    res.json(units);
  } catch (error) {
    console.error('获取空间单元失败:', error);
    res.status(500).json({ message: '获取失败' });
  }
});

// 获取配套设施列表
router.get('/facilities', async (req, res) => {
  try {
    const [facilities] = await db.query('SELECT * FROM space_facilities');
    res.json(facilities);
  } catch (error) {
    console.error('获取配套设施失败:', error);
    res.status(500).json({ message: '获取失败' });
  }
});

// 创建订单
router.post('/orders', async (req, res) => {
  try {
    const { userId, spaceUnitId, startDate, endDate, facilities } = req.body;

    if (!userId || !spaceUnitId || !startDate || !endDate) {
      return res.status(400).json({ message: '请填写完整信息' });
    }

    // 检查空间是否可用
    const [units] = await db.query(
      'SELECT * FROM space_units WHERE id = ? AND status = "available"',
      [spaceUnitId]
    );

    if (units.length === 0) {
      return res.status(400).json({ message: '该空间已被预订' });
    }

    const unit = units[0];

    // 计算总价
    const months = Math.ceil(
      (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24 * 30)
    );
    
    let totalPrice = unit.price_per_month * months;

    // 加上配套设施费用
    if (facilities && facilities.length > 0) {
      const [facilityPrices] = await db.query(
        'SELECT SUM(price) as total FROM space_facilities WHERE id IN (?)',
        [facilities]
      );
      totalPrice += (facilityPrices[0].total || 0) * months;
    }

    // 创建订单
    const [result] = await db.query(
      `INSERT INTO space_orders (user_id, space_unit_id, start_date, end_date, total_price, facilities)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, spaceUnitId, startDate, endDate, totalPrice, JSON.stringify(facilities || [])]
    );

    // 更新空间状态
    await db.query(
      'UPDATE space_units SET status = "reserved" WHERE id = ?',
      [spaceUnitId]
    );

    res.json({
      message: '订单创建成功',
      orderId: result.insertId,
      totalPrice,
    });
  } catch (error) {
    console.error('创建订单失败:', error);
    res.status(500).json({ message: '创建失败' });
  }
});

// 获取用户订单
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const [orders] = await db.query(`
      SELECT o.*, s.floor, s.unit_number, s.area
      FROM space_orders o
      JOIN space_units s ON o.space_unit_id = s.id
      WHERE o.user_id = ?
      ORDER BY o.created_at DESC
    `, [userId]);
    
    res.json(orders);
  } catch (error) {
    console.error('获取订单失败:', error);
    res.status(500).json({ message: '获取失败' });
  }
});

export default router;
