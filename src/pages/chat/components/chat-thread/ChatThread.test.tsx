import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../../../../test/utils';
import { ChatThread } from './index';

describe('ChatThread', () => {
  const baseMockProps = {
    quickReplies: ['Hola', 'Catálogo', 'Pedidos'],
    messages: [
      { role: 'user' as const, content: 'Hola' },
      { role: 'assistant' as const, content: '¡Hola! ¿En qué puedo ayudarte?' },
    ],
    isTyping: false,
    order: null,
    paymentIntent: null,
    onPaymentIntent: vi.fn(),
    onQuickReply: vi.fn(),
    transferInfo: null,
    paidNotice: null,
    onMarkPaid: vi.fn(),
  };

  function renderChatThread(overrides = {}) {
    const props = { ...baseMockProps, ...overrides };
    return renderWithProviders(
      <ChatThread
        quickReplies={props.quickReplies}
        messages={props.messages}
        isTyping={props.isTyping}
        order={props.order}
        paymentIntent={props.paymentIntent}
        onPaymentIntent={props.onPaymentIntent}
        onQuickReply={props.onQuickReply}
        transferInfo={props.transferInfo}
        paidNotice={props.paidNotice}
        onMarkPaid={props.onMarkPaid}
      />
    );
  }

  it('renders messages correctly', () => {
    const { getByText, getAllByText } = renderChatThread();
    // There are two "Hola" elements (one in messages, one in quick replies)
    expect(getAllByText('Hola')).toHaveLength(2);
    expect(getByText('¡Hola! ¿En qué puedo ayudarte?')).toBeInTheDocument();
  });

  it('renders quick replies', () => {
    const { getByRole } = renderChatThread();
    expect(getByRole('button', { name: 'Hola' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Catálogo' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Pedidos' })).toBeInTheDocument();
  });

  it('calls onQuickReply when quick reply is clicked', () => {
    const { getByRole } = renderChatThread();
    getByRole('button', { name: 'Hola' }).click();
    expect(baseMockProps.onQuickReply).toHaveBeenCalledWith('Hola');
  });

  it('shows typing indicator when isTyping is true', () => {
    const { container } = renderChatThread({ isTyping: true });
    // Check for the typing indicator (three animated dots)
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });

  it('renders order section when order exists', () => {
    const order = {
      publicCode: 'ORD-123',
      total: 5000,
      items: [{ name: 'Producto 1', quantity: 2, subtotal: 5000 }],
    };
    const { getByText, getAllByText } = renderChatThread({ order });
    expect(getByText('Pedido ORD-123')).toBeInTheDocument();
    expect(getByText('2x Producto 1')).toBeInTheDocument();
    // There are two $5.000 elements (subtotal and total), check both exist
    expect(getAllByText('$5.000')).toHaveLength(2);
  });

  it('shows payment options when order exists and no paymentIntent', () => {
    const order = {
      publicCode: 'ORD-123',
      total: 5000,
      items: [{ name: 'Producto 1', quantity: 2, subtotal: 5000 }],
    };
    const { getByRole } = renderChatThread({ order, paymentIntent: null });
    expect(getByRole('button', { name: 'Efectivo' })).toBeInTheDocument();
    expect(getByRole('button', { name: 'Transferencia' })).toBeInTheDocument();
  });

  it('calls onPaymentIntent when payment button is clicked', () => {
    const order = {
      publicCode: 'ORD-123',
      total: 5000,
      items: [{ name: 'Producto 1', quantity: 2, subtotal: 5000 }],
    };
    const { getByRole } = renderChatThread({ order, paymentIntent: null });
    getByRole('button', { name: 'Efectivo' }).click();
    expect(baseMockProps.onPaymentIntent).toHaveBeenCalledWith('cash');
  });
});
