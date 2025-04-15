import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

console.log("URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("KEY:", import.meta.env.VITE_SUPABASE_KEY);

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
);

export default function App() {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    vehicle_request: '',
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase.from('customer_requests').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Error loading customers');
    else setCustomers(data);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.from('customer_requests').insert([formData]);
    if (error) toast.error('Failed to add customer');
    else {
      toast.success('Customer added');
      setFormData({ name: '', email: '', phone: '', vehicle_request: '' });
      fetchCustomers();
    }
    setLoading(false);
  }

  async function handleDelete(id) {
    const confirm = window.confirm('Are you sure you want to delete this request?');
    if (!confirm) return;
    const { error } = await supabase.from('customer_requests').delete().eq('id', id);
    if (error) toast.error('Failed to delete');
    else {
      toast.success('Deleted successfully');
      fetchCustomers();
    }
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.vehicle_request.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#1e293b] text-white p-6">
      <Toaster richColors position="top-center" />
      <h1 className="text-4xl font-bold text-center mb-8">Classic Car Matcher</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white/10 p-6 rounded-2xl space-y-4 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Customer Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            placeholder="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            placeholder="Requested Vehicle (Year, Make, Model)"
            value={formData.vehicle_request}
            onChange={(e) => setFormData({ ...formData, vehicle_request: e.target.value })}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : 'Add Customer'}
        </Button>
      </form>

      <div className="max-w-3xl mx-auto mb-6">
        <Input
          placeholder="Search by name or vehicle..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="animate-spin h-8 w-8" />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-center">No customer requests found.</p>
        ) : (
          filteredCustomers.map((customer) => (
            <Card key={customer.id} className="bg-white/10">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold">{customer.name}</p>
                    <p className="text-sm text-white/70">{customer.email} • {customer.phone}</p>
                    <p className="text-white mt-1">{customer.vehicle_request}</p>
                  </div>
                  <Button variant="ghost" onClick={() => handleDelete(customer.id)}>
                    <Trash2 className="w-5 h-5 text-red-400 hover:text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
