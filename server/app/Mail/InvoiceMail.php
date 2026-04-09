<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $order;
    public $items;

    public function __construct($order, $items)
    {
        $this->order = $order;
        $this->items = $items;
    }

    public function build()
    {
        $pdf = Pdf::loadView('emails.invoice', [
            'order' => $this->order,
            'items' => $this->items,
        ]);

        return $this->subject('Your CareMeds Invoice #' . $this->order->id)
                    ->view('emails.invoice', [
                        'order' => $this->order,
                        'items' => $this->items,
                    ])
                    ->attachData(
                        $pdf->output(),
                        'invoice-' . $this->order->id . '.pdf',
                        ['mime' => 'application/pdf']
                    );
    }
}