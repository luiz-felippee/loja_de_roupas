import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { X, User, Phone, MapPin, Check, ShieldCheck } from 'lucide-react';
import { Customer } from '../../types';

export const CustomerProfileModal: React.FC = () => {
  const { customer, saveCustomer, isProfileModalOpen, setIsProfileModalOpen, addToast } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone);
      setAddress(customer.address);
      setNeighborhood(customer.neighborhood || '');
      setReference(customer.reference || '');
    }
  }, [customer, isProfileModalOpen]);

  if (!isProfileModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Atenção', 'Informe seu nome.', 'alert');
      return;
    }
    if (!phone.trim()) {
      addToast('Atenção', 'Informe seu WhatsApp ou telefone.', 'alert');
      return;
    }

    const updatedCustomer: Customer = {
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || 'Retirada no Balcão',
      neighborhood: neighborhood.trim() || undefined,
      reference: reference.trim() || undefined
    };

    saveCustomer(updatedCustomer);
    addToast('Dados salvos!', 'Seu perfil foi atualizado com sucesso.', 'success');
    setIsProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-md bg-[#141724] border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-5 animate-in fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Dados do Cliente</h3>
              <p className="text-[11px] text-zinc-400">Usados para agilizar suas compras e entregas</p>
            </div>
          </div>

          <button
            onClick={() => setIsProfileModalOpen(false)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Nome Completo *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João da Silva"
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              WhatsApp / Telefone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Endereço Principal
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ex: Rua São Paulo, 250 - Casa"
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Bairro
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="Centro"
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Ponto de Referência
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Perto da praça"
                className="w-full bg-[#1b1f2e] border border-zinc-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>
              Seus dados de contato e endereço são privados e visíveis apenas para a loja na hora de separar e entregar seu pedido.
            </span>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 bg-zinc-900 text-zinc-400 text-xs font-semibold rounded-xl hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold rounded-xl flex items-center gap-1.5 shadow"
            >
              <Check className="w-4 h-4" />
              Salvar Dados
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
