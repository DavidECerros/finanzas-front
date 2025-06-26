const supabase = require('../config/supabase');

exports.addTransaction = async (req, res) => {
  const { userId } = req.params; // Obtenido de la URL, debería ser el mismo que req.userId del middleware
  const { type, amount, description } = req.body;

  // Verificación básica del userId para asegurarse de que coincida con el autenticado
  if (req.userId !== userId) {
    return res.status(403).json({ message: 'Acceso no autorizado para este usuario.' });
  }

  if (!type || !amount) {
    return res.status(400).json({ message: 'Tipo y monto son requeridos.' });
  }
  if (typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({ message: 'El monto debe ser un número positivo.' });
  }
  if (!['income', 'expense'].includes(type)) {
    return res.status(400).json({ message: 'El tipo debe ser "income" o "expense".' });
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        { user_id: userId, type, amount, description, date: new Date().toISOString() }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error al añadir transacción:', error);
      return res.status(500).json({ message: 'Error al añadir transacción.' });
    }

    res.status(201).json({ message: 'Transacción añadida exitosamente', transaction: data });

  } catch (error) {
    console.error('Error interno del servidor al añadir transacción:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.getTransactions = async (req, res) => {
  const { userId } = req.params;

  if (req.userId !== userId) {
    return res.status(403).json({ message: 'Acceso no autorizado para este usuario.' });
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('type, amount, description, date, id') // Asegúrate de seleccionar el 'id'
      .eq('user_id', userId)
      .order('date', { ascending: false }); // Ordenar por fecha descendente

    if (error) {
      console.error('Error al obtener transacciones:', error);
      return res.status(500).json({ message: 'Error al obtener transacciones.' });
    }

    res.status(200).json({ transactions: data });

  } catch (error) {
    console.error('Error interno del servidor al obtener transacciones:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

exports.getBalance = async (req, res) => {
  const { userId } = req.params;

  if (req.userId !== userId) {
    return res.status(403).json({ message: 'Acceso no autorizado para este usuario.' });
  }

  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('type, amount')
      .eq('user_id', userId);

    if (error) {
      console.error('Error al obtener transacciones para balance:', error);
      return res.status(500).json({ message: 'Error al calcular balance.' });
    }

    let balance = 0;
    transactions.forEach(t => {
      if (t.type === 'income') {
        balance += parseFloat(t.amount);
      } else if (t.type === 'expense') {
        balance -= parseFloat(t.amount);
      }
    });

    res.status(200).json({ balance });

  } catch (error) {
    console.error('Error interno del servidor al calcular balance:', error);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};