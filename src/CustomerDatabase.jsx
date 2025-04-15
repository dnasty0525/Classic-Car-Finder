
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const CustomerDatabase = () => {
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', year: '', make: '', model: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('id', { ascending: false });

    if (error) console.error('Error fetching customers:', error.message);
    else setCustomers(data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddCustomer = async () => {
    if (!form.name || !form.email || !form.phone || !form.year || !form.make || !form.model) return;

    const { data, error } = await supabase
      .from('customers')
      .insert([form]);

    if (error) console.error('Error adding customer:', error.message);
    else {
      setCustomers([data[0], ...customers]);
      setForm({ name: '', email: '', phone: '', year: '', make: '', model: '' });
    }
  };

const testSupabaseConnection = async () => {
  const { data, error } = await supabase.from('customers').select('*').limit(1);

  if (error) {
    console.error('❌ Supabase connection error:', error.message);
    alert('Supabase connection failed. Check the console for details.');
  } else {
    console.log('✅ Supabase is working! Sample data:', data);
    alert('Supabase connection successful!');
  }
};

  return (
    <div>
      <h1>Classic Car Customer Matcher</h1>
      <div>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        <input name="year" placeholder="Year" value={form.year} onChange={handleChange} />
        <input name="make" placeholder="Make" value={form.make} onChange={handleChange} />
        <input name="model" placeholder="Model" value={form.model} onChange={handleChange} />
        <button onClick={handleAddCustomer}>Add Customer</button>
        <button onClick={checkMatches} style={{ marginLeft: '1rem' }}>Check for Matches</button>
        <button onClick={testSupabaseConnection} style={{ marginTop: '1rem' }}>
            Test Supabase Connection
          </button>
      </div>
      <ul>
        {customers.map((c) => (
          <li key={c.id}>
            {c.name} ({c.email}, {c.phone}) - {c.year} {c.make} {c.model}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CustomerDatabase;
