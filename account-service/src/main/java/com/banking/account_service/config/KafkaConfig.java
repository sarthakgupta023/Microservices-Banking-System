package com.banking.account_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    // Reply channel: account-service publishes results here for the saga orchestrator
    @Bean
    public NewTopic accountEventsTopic() {
        return TopicBuilder.name("account-events")
                .partitions(1)
                .replicas(1)
                .build();
    }

    // Inbound channel: account-service consumes debit/credit commands from here
    @Bean
    public NewTopic transactionEventsTopic() {
        return TopicBuilder.name("transaction-events")
                .partitions(1)
                .replicas(1)
                .build();
    }
}
