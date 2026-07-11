# Generations allow partial success with free retry on failed arms

When some Generation arms succeed and others fail, completed Content Outputs are kept. Failed arms can be retried without charging again for work that already succeeded. All-or-nothing failure was rejected because provider flakiness would discard good copy; charging again for provider failures was rejected as hostile.
