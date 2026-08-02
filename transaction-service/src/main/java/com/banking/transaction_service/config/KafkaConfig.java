package com.banking.transaction_service.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String TRANSACTION_EVENTS_TOPIC = "transaction-events";
    public static final String ACCOUNT_EVENTS_TOPIC = "account-events";
    public static final String TRANSACTION_NOTIFICATIONS_TOPIC = "transaction-notifications";

    @Bean
    public NewTopic transactionEventsTopic() {
        return TopicBuilder.name(TRANSACTION_EVENTS_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic accountEventsTopic() {
        return TopicBuilder.name(ACCOUNT_EVENTS_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic transactionNotificationsTopic() {
        return TopicBuilder.name(TRANSACTION_NOTIFICATIONS_TOPIC)
                .partitions(1)
                .replicas(1)
                .build();
    }
}
