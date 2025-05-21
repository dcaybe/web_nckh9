from rest_framework import serializers

class ExportDataSerializer(serializers.Serializer):
    """
    Serializer for data export requests
    """
    format = serializers.ChoiceField(choices=['pdf', 'excel', 'csv'])
    data_type = serializers.ChoiceField(choices=['scores', 'appeals', 'users', 'activities'])
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False)
    include_fields = serializers.ListField(child=serializers.CharField(), required=False)

    def validate(self, data):
        if data.get('start_date') and data.get('end_date'):
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError("Ngày bắt đầu phải trước ngày kết thúc")
        return data

class SyncDataSerializer(serializers.Serializer):
    """
    Serializer for data synchronization requests
    """
    sync_type = serializers.ChoiceField(choices=['full', 'incremental'])
    source_system = serializers.CharField()
    data_type = serializers.ChoiceField(choices=['scores', 'users', 'activities'])
    last_sync_time = serializers.DateTimeField(required=False)

    def validate(self, data):
        if data['sync_type'] == 'incremental' and not data.get('last_sync_time'):
            raise serializers.ValidationError("Yêu cầu last_sync_time cho đồng bộ tăng dần")
        return data

class ExportProgressSerializer(serializers.Serializer):
    """
    Serializer for tracking export task progress
    """
    task_id = serializers.CharField()
    progress = serializers.IntegerField(min_value=0, max_value=100)
    status = serializers.ChoiceField(choices=['pending', 'processing', 'completed', 'failed'])
    message = serializers.CharField(required=False)
    download_url = serializers.URLField(required=False)

class SyncProgressSerializer(serializers.Serializer):
    """
    Serializer for tracking synchronization task progress
    """
    task_id = serializers.CharField()
    progress = serializers.IntegerField(min_value=0, max_value=100)
    status = serializers.ChoiceField(choices=['pending', 'processing', 'completed', 'failed'])
    errors = serializers.ListField(child=serializers.CharField(), required=False)
    total_records = serializers.IntegerField(required=False)
    processed_records = serializers.IntegerField(required=False)
    success_rate = serializers.FloatField(read_only=True)

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        if ret.get('total_records') and ret.get('processed_records'):
            ret['success_rate'] = (ret['processed_records'] / ret['total_records']) * 100
        return ret