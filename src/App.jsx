import { useEffect, useState } from 'react';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Trash2 } from 'lucide-react';
import { Toaster, toast } from 'sonner';

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
  const [selectedMake, setSelectedMake] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      fetchAndMatchInventory();
    }
  }, [customers]);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase.from('customer_requests').select('*').order('created_at', { ascending: false });
    if (error) toast.error('Error loading customers');
    else setCustomers(data);
    setLoading(false);
  }

  async function fetchAndMatchInventory() {
    try {
      const res = await fetch('/api/proxy');
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'application/xml');
      const vehicleNodes = Array.from(xml.getElementsByTagName('vehicle'));
      const inventory = vehicleNodes.map(node => ({
        year: node.getElementsByTagName('year')[0]?.textContent.trim(),
        make: node.getElementsByTagName('make')[0]?.textContent.trim(),
        model: node.getElementsByTagName('model')[0]?.textContent.trim(),
      }));

      const matched = customers.filter(customer => {
        const [year, make, ...modelParts] = customer.vehicle_request.trim().split(' ');
        const model = modelParts.join(' ');
        return inventory.some(inv =>
          inv.year === year &&
          inv.make?.toLowerCase() === make?.toLowerCase() &&
          inv.model?.toLowerCase() === model?.toLowerCase()
        );
      });
      setMatches(matched);
    } catch (err) {
      console.error('Error fetching or parsing inventory XML:', err);
    }
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

  function parseMakeModel(vehicleStr) {
    const parts = vehicleStr.trim().split(' ');
    return {
      make: parts[1] || '',
      model: parts.slice(2).join(' ') || ''
    };
  }

  const allMakeModel = customers.map(c => parseMakeModel(c.vehicle_request));
  const uniqueMakes = [...new Set(allMakeModel.map(m => m.make))];
  const uniqueModels = [...new Set(
    allMakeModel
      .filter(m => selectedMake ? m.make === selectedMake : true)
      .map(m => m.model)
  )];

  const filteredCustomers = customers
    .map(c => ({ ...c, ...parseMakeModel(c.vehicle_request) }))
    .filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) &&
      (selectedMake ? c.make === selectedMake : true) &&
      (selectedModel ? c.model === selectedModel : true)
    )
    .sort((a, b) => {
      if (!sortBy) return 0;
      return a[sortBy].localeCompare(b[sortBy]);
    });

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans p-6">
      <Toaster richColors position="top-center" />
      <h1 className="text-4xl font-bold text-center mb-8">Classic Car Matcher</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-2xl shadow space-y-4 mb-10">
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

      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select
          className="p-2 rounded bg-white text-black"
          value={selectedMake}
          onChange={(e) => {
            setSelectedMake(e.target.value);
            setSelectedModel('');
          }}
        >
          <option value="">All Makes</option>
          {uniqueMakes.map(make => (
            <option key={make} value={make}>{make}</option>
          ))}
        </select>

        <select
          className="p-2 rounded bg-white text-black"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={!selectedMake}
        >
          <option value="">All Models</option>
          {uniqueModels.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>

        <select
          className="p-2 rounded bg-white text-black"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="">Sort By</option>
          <option value="make">Make (A–Z)</option>
          <option value="model">Model (A–Z)</option>
        </select>

        <button
          onClick={() => {
            setSelectedMake('');
            setSelectedModel('');
            setSortBy('');
          }}
          className="bg-gray-200 hover:bg-gray-300 text-black p-2 rounded"
        >
          Clear Filters
        </button>
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
            <Card key={customer.id} className="bg-white">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-lg font-semibold text-black">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.email} • {customer.phone}</p>
                    <p className="text-gray-800 mt-1">{customer.vehicle_request}</p>
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

      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl font-bold mb-4">Matched Requests</h2>
        {matches.length === 0 ? (
          <p>No matches found.</p>
        ) : (
          matches.map(match => (
            <Card key={match.id} className="bg-green-100">
              <CardContent className="p-4">
                <p className="font-semibold">{match.name}</p>
                <p className="text-sm text-gray-600">{match.email} • {match.phone}</p>
                <p className="text-gray-800">{match.vehicle_request}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
