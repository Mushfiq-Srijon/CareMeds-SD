<?php

namespace App\Mail;

use Illuminate\Mail\Transport\Transport;
use Swift_Mime_SimpleMessage;
use Resend;

class ResendTransport extends Transport
{
    protected string $apiKey;

    public function __construct(string $apiKey)
    {
        $this->apiKey = $apiKey;
    }

    public function send(Swift_Mime_SimpleMessage $message, &$failedRecipients = null)
    {
        $this->beforeSendPerformed($message);

        $client = Resend::client($this->apiKey);

        $from = $this->formatAddress($message->getFrom());
        $to = array_keys($message->getTo() ?? []);
        $subject = $message->getSubject();
        $html = $message->getBody();

        $client->emails->send([
            'from'    => $from,
            'to'      => $to,
            'subject' => $subject,
            'html'    => $html,
        ]);

        $this->sendPerformed($message);

        return $this->numberOfRecipients($message);
    }

    protected function formatAddress(array $addresses): string
    {
        foreach ($addresses as $email => $name) {
            return $name ? "{$name} <{$email}>" : $email;
        }
        return '';
    }
}