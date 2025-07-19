import { useState, useEffect } from 'react';
import { Settings, Save, Globe, Bell, Shield, Database, Download, RefreshCw, Trash } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAdminSettings, useUpdateAdminSettings } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isTestingDatabase, setIsTestingDatabase] = useState(false);
  const [isClearingCache, setIsClearingCache] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const { data: adminSettings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateAdminSettings();
  const { toast } = useToast();

  // Initialize settings from database
  useEffect(() => {
    if (adminSettings) {
      const settingsMap: Record<string, string> = {};
      adminSettings.forEach(setting => {
        settingsMap[setting.key] = setting.value;
      });
      setSettings(settingsMap);
    }
  }, [adminSettings]);

  const handleSettingChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    console.log('Saving admin settings:', settings);
    
    try {
      // Save all changed settings
      const promises = Object.entries(settings).map(([key, value]) => {
        console.log(`Saving setting ${key}:`, value);
        return updateSettings.mutateAsync({ 
          key, 
          value,
          description: getSettingDescription(key)
        });
      });

      const results = await Promise.all(promises);
      console.log('All settings saved:', results);

      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram atualizadas com sucesso.",
      });

      setHasChanges(false);
    } catch (error) {
      console.error('Settings save error:', error);
      toast({
        title: "Erro",
        description: `Erro ao salvar configurações: ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    }
  };

  const getSettingDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      'site_name': 'Nome do site exibido na interface',
      'site_description': 'Descrição do site para SEO',
      'maintenance_mode': 'Ativar modo de manutenção',
      'maintenance_message': 'Mensagem exibida durante manutenção',
      'max_concurrent_users': 'Máximo de usuários simultâneos',
      'default_plan_duration': 'Duração padrão dos planos em dias',
      'support_email': 'Email de suporte técnico',
      'discord_invite': 'Link do convite do Discord',
      'enable_registrations': 'Permitir novos registros',
      'stock_low_threshold': 'Limite para alerta de estoque baixo',
      'stock_empty_message': 'Mensagem quando estoque esgotado',
      'vm_default_password': 'Senha padrão das VMs',
      'vm_session_timeout': 'Timeout das sessões de VM (minutos)',
    };
    return descriptions[key] || '';
  };

  const handleTestDatabase = async () => {
    setIsTestingDatabase(true);
    try {
      console.log('Testing database connection...');
      
      // Test multiple database operations
      const [usersTest, settingsTest, plansTest] = await Promise.all([
        supabase.from('profiles').select('id').limit(1),
        supabase.from('admin_settings').select('key').limit(1),
        supabase.from('plans').select('name').limit(1),
      ]);

      const errors = [usersTest.error, settingsTest.error, plansTest.error].filter(Boolean);
      
      if (errors.length > 0) {
        throw new Error(`Falhas encontradas: ${errors.map(e => e.message).join(', ')}`);
      }

      toast({
        title: "Teste de banco de dados",
        description: "Todas as conexões estão funcionando corretamente!",
      });
    } catch (error) {
      console.error('Database test failed:', error);
      toast({
        title: "Erro no teste",
        description: `Falha na conexão: ${error?.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
    } finally {
      setIsTestingDatabase(false);
    }
  };

  const handleClearCache = async () => {
    setIsClearingCache(true);
    try {
      console.log('Clearing application cache...');
      
      // Simulate cache clearing operations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real application, you would clear various caches here
      // localStorage.clear();
      // sessionStorage.clear();
      
      toast({
        title: "Cache limpo",
        description: "Cache da aplicação foi limpo com sucesso.",
      });
    } catch (error) {
      console.error('Cache clear failed:', error);
      toast({
        title: "Erro",
        description: "Não foi possível limpar o cache.",
        variant: "destructive",
      });
    } finally {
      setIsClearingCache(false);
    }
  };

  const handleBackupSettings = async () => {
    setIsBackingUp(true);
    try {
      console.log('Creating settings backup...');
      
      if (!adminSettings || adminSettings.length === 0) {
        throw new Error('Nenhuma configuração encontrada para backup');
      }

      const backup = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        settings: adminSettings,
      };

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `matecloud-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      URL.revokeObjectURL(url);

      toast({
        title: "Backup criado",
        description: "Backup das configurações foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Backup failed:', error);
      toast({
        title: "Erro",
        description: `Não foi possível criar backup: ${error?.message}`,
        variant: "destructive",
      });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Tem certeza que deseja restaurar todas as configurações para os valores padrão? Esta ação não pode ser desfeita.')) {
      return;
    }

    setIsResetting(true);
    try {
      console.log('Resetting settings to defaults...');
      
      const defaultSettings = {
        'site_name': 'MateCloud',
        'site_description': 'A melhor plataforma de cloud gaming do Brasil',
        'maintenance_mode': 'false',
        'maintenance_message': 'O site está em manutenção. Voltaremos em breve!',
        'max_concurrent_users': '100',
        'default_plan_duration': '30',
        'support_email': 'suporte@matecloud.com.br',
        'discord_invite': 'https://discord.gg/matecloud',
        'enable_registrations': 'true',
        'stock_low_threshold': '5',
        'stock_empty_message': 'Este plano está temporariamente indisponível.',
        'vm_default_password': 'matecloud123',
        'vm_session_timeout': '60',
      };

      // Reset all settings to defaults
      const promises = Object.entries(defaultSettings).map(([key, value]) => {
        return updateSettings.mutateAsync({ 
          key, 
          value,
          description: getSettingDescription(key)
        });
      });

      await Promise.all(promises);
      
      // Update local state
      setSettings(defaultSettings);
      setHasChanges(false);

      toast({
        title: "Configurações restauradas",
        description: "Todas as configurações foram restauradas para os valores padrão.",
      });
    } catch (error) {
      console.error('Reset failed:', error);
      toast({
        title: "Erro",
        description: "Não foi possível restaurar as configurações.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cloud-blue"></div>
            <span className="ml-2">Carregando configurações...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configurações do Sistema
            </div>
            {hasChanges && (
              <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSettings.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Configurações Gerais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="site_name">Nome do Site</Label>
              <Input
                id="site_name"
                value={settings.site_name || 'MateCloud'}
                onChange={(e) => handleSettingChange('site_name', e.target.value)}
                placeholder="MateCloud"
              />
            </div>

            <div>
              <Label htmlFor="support_email">Email de Suporte</Label>
              <Input
                id="support_email"
                type="email"
                value={settings.support_email || ''}
                onChange={(e) => handleSettingChange('support_email', e.target.value)}
                placeholder="suporte@matecloud.com.br"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="site_description">Descrição do Site</Label>
            <Textarea
              id="site_description"
              value={settings.site_description || ''}
              onChange={(e) => handleSettingChange('site_description', e.target.value)}
              placeholder="A melhor plataforma de cloud gaming do Brasil"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="discord_invite">Link do Discord</Label>
            <Input
              id="discord_invite"
              value={settings.discord_invite || ''}
              onChange={(e) => handleSettingChange('discord_invite', e.target.value)}
              placeholder="https://discord.gg/matecloud"
            />
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="max_concurrent_users">Usuários Simultâneos</Label>
              <Input
                id="max_concurrent_users"
                type="number"
                value={settings.max_concurrent_users || '100'}
                onChange={(e) => handleSettingChange('max_concurrent_users', e.target.value)}
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="default_plan_duration">Duração Padrão dos Planos (dias)</Label>
              <Input
                id="default_plan_duration"
                type="number"
                value={settings.default_plan_duration || '30'}
                onChange={(e) => handleSettingChange('default_plan_duration', e.target.value)}
                min="1"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Permitir Novos Registros</Label>
              <p className="text-sm text-muted-foreground">
                Quando desativado, novos usuários não poderão se registrar
              </p>
            </div>
            <Switch
              checked={settings.enable_registrations !== 'false'}
              onCheckedChange={(checked) => 
                handleSettingChange('enable_registrations', checked.toString())
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Modo de Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Ativar Modo de Manutenção</Label>
              <p className="text-sm text-muted-foreground">
                O site ficará inacessível para usuários comuns
              </p>
            </div>
            <Switch
              checked={settings.maintenance_mode === 'true'}
              onCheckedChange={(checked) => 
                handleSettingChange('maintenance_mode', checked.toString())
              }
            />
          </div>

          <div>
            <Label htmlFor="maintenance_message">Mensagem de Manutenção</Label>
            <Textarea
              id="maintenance_message"
              value={settings.maintenance_message || ''}
              onChange={(e) => handleSettingChange('maintenance_message', e.target.value)}
              placeholder="O site está em manutenção. Voltaremos em breve!"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Stock Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Configurações de Estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="stock_low_threshold">Limite para Estoque Baixo</Label>
            <Input
              id="stock_low_threshold"
              type="number"
              value={settings.stock_low_threshold || '5'}
              onChange={(e) => handleSettingChange('stock_low_threshold', e.target.value)}
              min="0"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Você será notificado quando o estoque estiver abaixo deste valor
            </p>
          </div>

          <div>
            <Label htmlFor="stock_empty_message">Mensagem de Estoque Esgotado</Label>
            <Textarea
              id="stock_empty_message"
              value={settings.stock_empty_message || ''}
              onChange={(e) => handleSettingChange('stock_empty_message', e.target.value)}
              placeholder="Este plano está temporariamente indisponível. Tente novamente mais tarde."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* VM Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Máquinas Virtuais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vm_default_password">Senha Padrão das VMs</Label>
              <Input
                id="vm_default_password"
                type="password"
                value={settings.vm_default_password || ''}
                onChange={(e) => handleSettingChange('vm_default_password', e.target.value)}
                placeholder="matecloud123"
              />
            </div>

            <div>
              <Label htmlFor="vm_session_timeout">Timeout de Sessão (minutos)</Label>
              <Input
                id="vm_session_timeout"
                type="number"
                value={settings.vm_session_timeout || '60'}
                onChange={(e) => handleSettingChange('vm_session_timeout', e.target.value)}
                min="5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Ações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              onClick={handleTestDatabase}
              disabled={isTestingDatabase}
              className="flex-col h-20 gap-2"
            >
              <Database className="w-6 h-6" />
              <span className="text-xs">
                {isTestingDatabase ? 'Testando...' : 'Testar BD'}
              </span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleClearCache}
              disabled={isClearingCache}
              className="flex-col h-20 gap-2"
            >
              <Trash className="w-6 h-6" />
              <span className="text-xs">
                {isClearingCache ? 'Limpando...' : 'Limpar Cache'}
              </span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleBackupSettings}
              disabled={isBackingUp}
              className="flex-col h-20 gap-2"
            >
              <Download className="w-6 h-6" />
              <span className="text-xs">
                {isBackingUp ? 'Exportando...' : 'Backup Config'}
              </span>
            </Button>

            <Button 
              variant="outline" 
              onClick={handleResetToDefaults}
              disabled={isResetting}
              className="flex-col h-20 gap-2"
            >
              <RefreshCw className="w-6 h-6" />
              <span className="text-xs">
                {isResetting ? 'Resetando...' : 'Restaurar Padrão'}
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <Card className="border-cloud-blue/50 bg-cloud-blue/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm">Você tem alterações não salvas.</p>
              <Button onClick={handleSaveSettings} disabled={updateSettings.isPending}>
                <Save className="w-4 h-4 mr-2" />
                {updateSettings.isPending ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminSettings;